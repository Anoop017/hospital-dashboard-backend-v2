import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as dns from 'node:dns';
import { winstonConfig } from './config/logger.config';

dns.setServers(['8.8.8.8', '8.8.4.4']);

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonConfig,
  });
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get('app.corsOrigins'),
    credentials: true,
  });

  // Global Prefix
  const apiPrefix = configService.get<string>('app.apiPrefix') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Global Filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Hospital Management API')
    .setDescription('The Hospital Patient Care Management System API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document);

  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`Swagger docs at: http://localhost:${port}/${apiPrefix}/docs`);
}
bootstrap();
