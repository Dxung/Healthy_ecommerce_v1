import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { setupSwagger } from './common/configs/swagger.config';
import { getValidationPipeOptions } from './common/configs/validation.config';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.use(cookieParser());

  setupSwagger(app);

  app.useGlobalPipes(
    new ValidationPipe(
      getValidationPipeOptions(process.env.NODE_ENV === 'production'),
    ),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
