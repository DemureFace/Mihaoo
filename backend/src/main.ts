import * as dotenv from 'dotenv';
dotenv.config({
  path: `${process.cwd()}/.env`,
});
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  console.log('CWD:', process.cwd());
  console.log('FIGMA_TOKEN exists:', Boolean(process.env.FIGMA_TOKEN));
  console.log('BANNER_EXPORT_STORAGE:', process.env.BANNER_EXPORT_STORAGE);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Mihaoo API')
    .setDescription('Backend API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
