import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { imageSize } from 'image-size';
import { FileValidationConfig } from './file-validation.config';
import { ExceptionSource } from '../exception filters/exception-source';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly config: FileValidationConfig) {}

  transform(
    file: Express.Multer.File,
    metadata: ArgumentMetadata,
  ): Express.Multer.File {
    const errors: { field: string; errors: string[] }[] = [];

    //1.Check if file exists
    //If not: add error to the errors array and use throwValidationException function
    if (!file) {
      errors.push({
        field: metadata.data || 'file',
        errors: ['File is required'],
      });
      this.throwValidationException(errors);
    }

    //2.Validate file size
    //If not: add error to the errors array and use throwValidationException function
    const maxSizeInBytes = this.config.maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      errors.push({
        field: metadata.data || 'file',
        errors: [
          `File size must not exceed ${this.config.maxSizeInMB}MB (received ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
        ],
      });
    }

    //3.Validate MIME type
    //If not: add error to the errors array and use throwValidationException function
    if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
      errors.push({
        field: metadata.data || 'file',
        errors: [
          `File type must be one of: ${this.config.allowedMimeTypes.join(', ')} (received ${file.mimetype})`,
        ],
      });
    }

    //4. Validate image dimensions if configured
    //5. Try-catch incase of corrupted image file
    if (
      this.config.minWidth ||
      this.config.maxWidth ||
      this.config.minHeight ||
      this.config.maxHeight
    ) {
      try {
        const dimensions = imageSize(file.buffer);

        if (dimensions.width && dimensions.height) {
          const dimensionErrors: string[] = [];

          if (this.config.minWidth && dimensions.width < this.config.minWidth) {
            dimensionErrors.push(
              `Image width must be at least ${this.config.minWidth}px (received ${dimensions.width}px)`,
            );
          }

          if (this.config.maxWidth && dimensions.width > this.config.maxWidth) {
            dimensionErrors.push(
              `Image width must not exceed ${this.config.maxWidth}px (received ${dimensions.width}px)`,
            );
          }

          if (
            this.config.minHeight &&
            dimensions.height < this.config.minHeight
          ) {
            dimensionErrors.push(
              `Image height must be at least ${this.config.minHeight}px (received ${dimensions.height}px)`,
            );
          }

          if (
            this.config.maxHeight &&
            dimensions.height > this.config.maxHeight
          ) {
            dimensionErrors.push(
              `Image height must not exceed ${this.config.maxHeight}px (received ${dimensions.height}px)`,
            );
          }

          if (dimensionErrors.length > 0) {
            errors.push({
              field: metadata.data || 'file',
              errors: dimensionErrors,
            });
          }
        }
      } catch (error) {
        const errorMessage = `Failed to read image dimensions. File may be corrupted. Original error: ${this.stringifyError(error)}`;
        errors.push({
          field: metadata.data || 'file',
          errors: [errorMessage],
        });
      }
    }

    // Throw exception if there are any validation errors
    if (errors.length > 0) {
      this.throwValidationException(errors);
    }

    return file;
  }

  private stringifyError(error: unknown): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    return String(error);
  }

  private throwValidationException(
    errors: { field: string; errors: string[] }[],
  ): never {
    throw new BadRequestException(
      {
        message: 'File validation failed',
        errors: errors,
      },
      {
        cause: {
          source: ExceptionSource.FILE_VALIDATION,
          details: errors,
        },
      },
    );
  }
}
