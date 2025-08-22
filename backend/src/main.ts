import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const domain = process.env.DOMAIN;
  const prodOrigins = domain ? [`https://${domain}`, `https://api.${domain}`] : [];
  const origins = process.env.NODE_ENV === 'production' ? prodOrigins : [/^http:\/\/localhost:\d+$/];
  app.enableCors({ origin: origins, credentials: false });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000, '0.0.0.0');
}
bootstrap();
