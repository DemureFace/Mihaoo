import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { BannerExportService } from './banner-export.service';
import { CreateBannerExportDto } from './dto/create-banner-export.dto';

@Controller('banner-exports')
export class BannerExportController {
  constructor(private readonly bannerExportService: BannerExportService) {}

  @Post()
  create(@Body() dto: CreateBannerExportDto) {
    return this.bannerExportService.createExport(dto);
  }

  @Get(':id')
  getJob(@Param('id') id: string) {
    return this.bannerExportService.getJob(id);
  }

  @Get(':id/download')
  download(@Param('id') id: string, @Res() res: Response) {
    const zipPath = this.bannerExportService.getZipPath(id);

    return res.download(zipPath);
  }
}
