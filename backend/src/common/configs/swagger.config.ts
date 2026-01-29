import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

/**
 * Interface that shape the options for Swagger configuration.
 */
interface SwaggerConfigOptions {
  title?: string;
  description?: string;
  version?: string;
  path?: string;
  enabled?: boolean;
}

/**
 * Defines and sets up Swagger documentation for the NestJS application.
 */
export function setupSwagger(
  app: INestApplication,
  options: SwaggerConfigOptions = {},
): void {
  const {
    title = 'My API Documentation',
    description = 'The API documentation used for FE from NestJS backend',
    version = '1.0',
    path = 'api/docs',
    enabled = process.env.NODE_ENV?.trim() !== 'production',
  } = options; //default values
  if (!enabled) {
    return;
  }

  //final config created
  const config = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setVersion(version)
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(path, app, documentFactory);
}
