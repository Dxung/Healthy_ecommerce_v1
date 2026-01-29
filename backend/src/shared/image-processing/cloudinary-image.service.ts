import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result, ResultAsync, err, errAsync, ok } from 'neverthrow';
import { v2 as cloudinary } from 'cloudinary';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { IMAGE_PROCESSING_ERRORS } from './errors/image-processing.errors';
import type {
  IImageProcessingService,
  UploadResult,
} from './interfaces/image-processing.service.interface';
import type {
  CloudinaryConfig,
  ValidationConfig,
} from './interfaces/image-processing-config.interface';
import { WithPosition } from 'src/common/decorators/with-position.decorator';

@Injectable()
export class CloudinaryImageService implements IImageProcessingService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Gets Cloudinary configuration from ConfigService
   * @returns Result<CloudinaryConfig, DomainError>
   */
  private getCloudinaryConfig(): Result<CloudinaryConfig, DomainError> {
    const config = this.configService.get<CloudinaryConfig>(
      'imageProcessing.cloudinary',
    );

    if (!config?.cloudName || !config?.apiKey) {
      return err(
        createDomainError(IMAGE_PROCESSING_ERRORS.CONFIGURATION_ERROR, {
          cause: 'CRITICAL: Cloudinary configuration is missing',
        }),
      );
    }

    return ok(config);
  }

  /**
   * Gets validation configuration from ConfigService
   * @returns Result<ValidationConfig, DomainError>
   */
  private getValidationConfig(): Result<ValidationConfig, DomainError> {
    const config = this.configService.get<ValidationConfig>(
      'imageProcessing.validation',
    );

    if (!config?.maxFileSize || !config?.allowedMimeTypes) {
      return err(
        createDomainError(IMAGE_PROCESSING_ERRORS.CONFIGURATION_ERROR, {
          cause: 'CRITICAL: Validation configuration is missing',
        }),
      );
    }

    return ok(config);
  }

  /**
   * Gets default avatar URL from ConfigService
   * @returns Result<string, DomainError>
   */
  private getDefaultAvatarUrlConfig(): Result<string, DomainError> {
    const url = this.configService.get<string>(
      'imageProcessing.defaultAvatarUrl',
    );

    if (!url) {
      return err(
        createDomainError(IMAGE_PROCESSING_ERRORS.CONFIGURATION_ERROR, {
          cause: 'CRITICAL: Default avatar URL configuration is missing',
        }),
      );
    }

    return ok(url);
  }

  /**
   * Initializes Cloudinary with configuration
   * @returns Result<void, DomainError>
   */
  private initializeCloudinary(): Result<void, DomainError> {
    const configResult = this.getCloudinaryConfig();

    if (configResult.isErr()) {
      return err(configResult.error);
    }

    const config = configResult.value;
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
    });

    return ok(undefined);
  }

  /**
   * Validates file size and type synchronously
   * @param file - The file buffer to validate
   * @param mimetype - The mimetype of the file
   * @returns Result<void, DomainError>
   */
  @WithPosition()
  validateFile(file: Buffer, mimetype: string): Result<void, DomainError> {
    // Get validation config
    const configResult = this.getValidationConfig();
    if (configResult.isErr()) {
      return err(configResult.error);
    }

    const { maxFileSize, allowedMimeTypes } = configResult.value;

    // Check file size
    if (file.length > maxFileSize) {
      return err(
        createDomainError(IMAGE_PROCESSING_ERRORS.FILE_TOO_LARGE, {
          cause: IMAGE_PROCESSING_ERRORS.FILE_TOO_LARGE.message,
        }),
      );
    }

    // Check mimetype
    if (!allowedMimeTypes.includes(mimetype)) {
      return err(
        createDomainError(IMAGE_PROCESSING_ERRORS.INVALID_FILE_TYPE, {
          cause: IMAGE_PROCESSING_ERRORS.INVALID_FILE_TYPE.message,
        }),
      );
    }

    return ok(undefined);
  }

  /**
   * Uploads an image to Cloudinary using an upload preset
   * Note: Cloudinary auto-converts images to JPG based on upload preset configuration
   * @param imageBuffer - The image buffer to upload
   * @param uploadPreset - Cloudinary upload preset name (contains folder, transformations, format, etc.)
   * @returns ResultAsync<UploadResult, DomainError>
   */
  @WithPosition()
  uploadImage(
    imageBuffer: Buffer,
    uploadPreset: string,
  ): ResultAsync<UploadResult, DomainError> {
    // Initialize Cloudinary
    const initResult = this.initializeCloudinary();
    if (initResult.isErr()) {
      return errAsync(initResult.error);
    }

    return ResultAsync.fromPromise(
      new Promise<UploadResult>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            upload_preset: uploadPreset,
            resource_type: 'image',
          },
          (error, result) => {
            if (error || !result) {
              // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
              reject(error || 'Unknown upload error');
              return;
            }
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          },
        );

        uploadStream.end(imageBuffer);
      }),
      (error) => {
        return createDomainError(IMAGE_PROCESSING_ERRORS.UPLOAD_FAILED, {
          cause: error,
        });
      },
    );
  }

  /**
   * Deletes an image from Cloudinary by its public ID
   * @param publicId - The Cloudinary public ID of the image
   * @returns ResultAsync<void, DomainError>
   */
  @WithPosition()
  deleteImage(publicId: string): ResultAsync<void, DomainError> {
    // Initialize Cloudinary
    const initResult = this.initializeCloudinary();
    if (initResult.isErr()) {
      return errAsync(initResult.error);
    }

    return ResultAsync.fromPromise(
      cloudinary.uploader.destroy(publicId).then(() => {
        // TODO: LOG - Add proper logging for delete operations
        // Possible result values: 'ok' (deleted), 'not found' (already deleted/doesn't exist)
        // For now, we treat both as success since the end result is the same
        // In production, log 'not found' cases for monitoring
        return undefined;
      }),
      (error) => {
        return createDomainError(IMAGE_PROCESSING_ERRORS.DELETE_FAILED, {
          cause: error,
        });
      },
    );
  }

  /**
   * Processes and uploads an avatar image
   * Note: Image processing (format conversion) is handled by Cloudinary via upload preset
   * @param fileBuffer - The original image buffer
   * @param mimetype - The mimetype of the file
   * @param uploadPreset - Cloudinary upload preset name (contains folder, transformations, etc.)
   * @returns ResultAsync<UploadResult, DomainError>
   */
  @WithPosition()
  processAndUploadAvatar(
    fileBuffer: Buffer,
    mimetype: string,
    uploadPreset: string,
  ): ResultAsync<UploadResult, DomainError> {
    // Validate file first (synchronous)
    const validationResult = this.validateFile(fileBuffer, mimetype);

    if (validationResult.isErr()) {
      return errAsync(validationResult.error);
    }

    // Upload directly - Cloudinary handles format conversion via upload preset
    return this.uploadImage(fileBuffer, uploadPreset);
  }

  /**
   * Gets the default avatar URL
   * @returns string
   */
  getDefaultAvatarUrl(): string {
    const urlResult = this.getDefaultAvatarUrlConfig();

    if (urlResult.isErr()) {
      // Fallback to empty string if config is missing
      // This maintains backward compatibility with existing code
      return '';
    }

    return urlResult.value;
  }

  /**
   * Extracts the public ID from a Cloudinary URL
   * @param url - The Cloudinary URL
   * @returns string | null - The public ID or null if not found
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      // Cloudinary URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}
