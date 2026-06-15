import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BannerExportNodeDto {
  @IsString()
  id: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  scale?: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;
}

export class BannerExportQualityDto {
  @IsOptional()
  @IsNumber()
  webp?: number;

  @IsOptional()
  @IsNumber()
  pngCompressionLevel?: number;

  @IsOptional()
  @IsBoolean()
  sharpen?: boolean;
}

export class BannerExportEnhanceDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}

export class CreateBannerExportDto {
  @IsString()
  campaignId: string;

  @IsOptional()
  @IsString()
  figmaFileKey?: string;

  @IsOptional()
  @IsString()
  figmaFileUrl?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BannerExportNodeDto)
  nodes: BannerExportNodeDto[];

  @IsOptional()
  @IsArray()
  @IsIn(['png', 'webp'], { each: true })
  formats?: Array<'png' | 'webp'>;

  @IsOptional()
  @ValidateNested()
  @Type(() => BannerExportQualityDto)
  quality?: BannerExportQualityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => BannerExportEnhanceDto)
  enhance?: BannerExportEnhanceDto;
}
