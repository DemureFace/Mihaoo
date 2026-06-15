import { Module } from '@nestjs/common';
import { BannerExportController } from './banner-export.controller';
import { BannerExportService } from './banner-export.service';

@Module({
  controllers: [BannerExportController],
  providers: [BannerExportService],
})
export class BannerExportModule {}
