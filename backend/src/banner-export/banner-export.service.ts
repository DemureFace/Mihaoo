import * as dotenv from 'dotenv';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import axios from 'axios';
import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { writeFile } from 'fs/promises';
import { CreateBannerExportDto } from './dto/create-banner-export.dto';

const AdmZip = require('adm-zip');

dotenv.config({
  path: join(process.cwd(), '.env'),
  override: true,
});

type JobStatus = 'processing' | 'completed' | 'failed';

type ExportJob = {
  id: string;
  status: JobStatus;
  progress: number;
  error?: string;
  zipPath?: string;
  downloadUrl?: string;
  createdAt: string;
};

@Injectable()
export class BannerExportService {
  private jobs = new Map<string, ExportJob>();

  private storageDir =
    process.env.BANNER_EXPORT_STORAGE || './storage/banner-exports';

  async createExport(dto: CreateBannerExportDto) {
    if (!dto.nodes?.length) {
      throw new BadRequestException('nodes are required');
    }

    const figmaFileKey =
      dto.figmaFileKey || this.extractFigmaFileKey(dto.figmaFileUrl);

    if (!figmaFileKey) {
      throw new BadRequestException('figmaFileKey or figmaFileUrl is required');
    }

    const jobId = randomUUID();

    const job: ExportJob = {
      id: jobId,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toISOString(),
    };

    this.jobs.set(jobId, job);

    this.processExport(jobId, figmaFileKey, dto).catch((error) => {
      console.error('Banner export failed message:', error?.message);
      console.error('Banner export failed status:', error?.response?.status);
      console.error('Banner export failed data:', error?.response?.data);
      console.error('Banner export failed url:', error?.config?.url);

      const failedJob = this.jobs.get(jobId);

      if (failedJob) {
        failedJob.status = 'failed';
        failedJob.error =
          error?.response?.data?.err ||
          error?.response?.data?.message ||
          error?.message ||
          'Export failed';
        failedJob.progress = 100;
        this.jobs.set(jobId, failedJob);
      }
    });

    return job;
  }

  getJob(jobId: string) {
    const job = this.jobs.get(jobId);

    if (!job) {
      throw new NotFoundException('Export job not found');
    }

    return job;
  }

  getZipPath(jobId: string) {
    const job = this.getJob(jobId);

    if (job.status !== 'completed' || !job.zipPath) {
      throw new BadRequestException('Export is not completed yet');
    }

    return job.zipPath;
  }

  private async processExport(
    jobId: string,
    figmaFileKey: string,
    dto: CreateBannerExportDto,
  ) {
    this.ensureStorageDir();

    const jobDir = join(this.storageDir, jobId);
    mkdirSync(jobDir, { recursive: true });

    const formats = dto.formats?.length ? dto.formats : ['png', 'webp'];
    const webpQuality = dto.quality?.webp ?? 86;
    const pngCompressionLevel = dto.quality?.pngCompressionLevel ?? 9;
    const shouldSharpen = dto.quality?.sharpen ?? true;

    const nodeIds = dto.nodes.map((node) => node.id).join(',');
    const scale = dto.nodes[0]?.scale || 2;

    this.updateProgress(jobId, 10);

    const imageUrls = await this.getFigmaImageUrls(
      figmaFileKey,
      nodeIds,
      scale,
    );

    this.updateProgress(jobId, 25);

    const manifest: any[] = [];

    for (let index = 0; index < dto.nodes.length; index++) {
      const node = dto.nodes[index];
      const imageUrl = imageUrls[node.id];

      if (!imageUrl) {
        manifest.push({
          nodeId: node.id,
          name: node.name || node.id,
          status: 'skipped',
          reason: 'Figma did not return image URL for this node',
        });

        continue;
      }

      const originalBuffer = await this.downloadImage(imageUrl);

      let image = sharp(originalBuffer);

      if (node.width && node.height) {
        image = image.resize(node.width, node.height, {
          fit: 'cover',
        });
      }

      if (shouldSharpen) {
        image = image.sharpen();
      }

      const safeName = this.safeFileName(node.name || node.id);

      if (formats.includes('png')) {
        const pngPath = join(jobDir, `${safeName}.png`);

        await image
          .clone()
          .png({
            compressionLevel: pngCompressionLevel,
            adaptiveFiltering: true,
          })
          .toFile(pngPath);

        manifest.push({
          nodeId: node.id,
          name: safeName,
          format: 'png',
          file: `${safeName}.png`,
        });
      }

      if (formats.includes('webp')) {
        const webpPath = join(jobDir, `${safeName}.webp`);

        await image
          .clone()
          .webp({
            quality: webpQuality,
          })
          .toFile(webpPath);

        manifest.push({
          nodeId: node.id,
          name: safeName,
          format: 'webp',
          file: `${safeName}.webp`,
        });
      }

      const progress = 25 + Math.round(((index + 1) / dto.nodes.length) * 55);
      this.updateProgress(jobId, progress);
    }

    const manifestPath = join(jobDir, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    this.updateProgress(jobId, 85);

    const zipPath = join(this.storageDir, `${jobId}.zip`);
    await this.createZip(jobDir, zipPath);

    const backendUrl =
      process.env.BACKEND_PUBLIC_URL || 'http://localhost:3000';

    const job = this.jobs.get(jobId);

    if (job) {
      job.status = 'completed';
      job.progress = 100;
      job.zipPath = zipPath;
      job.downloadUrl = `${backendUrl}/banner-exports/${jobId}/download`;
      this.jobs.set(jobId, job);
    }
  }

  private async getFigmaImageUrls(
    fileKey: string,
    nodeIds: string,
    scale: number,
  ) {
    const figmaToken = process.env.FIGMA_TOKEN;

    if (!figmaToken) {
      throw new BadRequestException('FIGMA_TOKEN is missing in backend .env');
    }

    return this.withRetry(async () => {
      const response = await axios.get(
        `https://api.figma.com/v1/images/${fileKey}`,
        {
          headers: {
            'X-Figma-Token': figmaToken.trim(),
          },
          params: {
            ids: nodeIds,
            format: 'png',
            scale,
          },
        },
      );

      if (response.data?.err) {
        throw new BadRequestException(response.data.err);
      }

      const images = response.data?.images || {};

      if (!images || Object.keys(images).length === 0) {
        throw new BadRequestException(
          'Figma returned no images. Check figmaFileKey and nodeId.',
        );
      }

      return images;
    });
  }

  private async downloadImage(url: string) {
    if (!url) {
      throw new BadRequestException('Figma image URL is empty');
    }

    return this.withRetry(async () => {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
      });

      return Buffer.from(response.data);
    });
  }

  private async createZip(sourceDir: string, zipPath: string) {
    const zip = new AdmZip();

    zip.addLocalFolder(sourceDir);
    zip.writeZip(zipPath);
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async withRetry<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error: any) {
      const status = error?.response?.status;

      const message =
        error?.response?.data?.err ||
        error?.response?.data?.message ||
        error?.message ||
        'Request failed';

      if (status === 429) {
        throw new BadRequestException(
          'Figma rate limit exceeded. Please wait and try again later.',
        );
      }

      throw new BadRequestException(message);
    }
  }

  private updateProgress(jobId: string, progress: number) {
    const job = this.jobs.get(jobId);

    if (job) {
      job.progress = progress;
      this.jobs.set(jobId, job);
    }
  }

  private ensureStorageDir() {
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true });
    }
  }

  private extractFigmaFileKey(url?: string) {
    if (!url) return null;

    const match = url.match(/figma\.com\/(?:file|design)\/([^/?]+)/);

    return match?.[1] || null;
  }

  private safeFileName(value: string) {
    return value
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
  }
}
