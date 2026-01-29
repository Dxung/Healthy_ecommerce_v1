import { Result, ResultAsync } from 'neverthrow';
import type { DomainError } from '../../types/domain-error.type';

/**
 * Result of a successful image upload
 */
export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Interface for image processing service
 * Handles image validation and cloud storage operations
 */
export interface IImageProcessingService {
  /**
   * Validates file size and type
   * @param file - The file buffer to validate
   * @param mimetype - The mimetype of the file
   * @returns Result<void, DomainError>
   */
  validateFile(file: Buffer, mimetype: string): Result<void, DomainError>;

  /**
   * Uploads an image to Cloudinary using an upload preset
   * @param imageBuffer - The processed image buffer
   * @param uploadPreset - Cloudinary upload preset name (contains folder, transformations, etc.)
   * @returns ResultAsync<UploadResult, DomainError>
   */
  uploadImage(
    imageBuffer: Buffer,
    uploadPreset: string,
  ): ResultAsync<UploadResult, DomainError>;

  /**
   * Deletes an image from Cloudinary by its public ID
   * @param publicId - The Cloudinary public ID of the image
   * @returns ResultAsync<void, DomainError>
   */
  deleteImage(publicId: string): ResultAsync<void, DomainError>;

  /**
   * Processes and uploads an avatar image
   * @param fileBuffer - The original image buffer
   * @param mimetype - The mimetype of the file
   * @param uploadPreset - Cloudinary upload preset name (contains folder, transformations, etc.)
   * @returns ResultAsync<UploadResult, DomainError>
   */
  processAndUploadAvatar(
    fileBuffer: Buffer,
    mimetype: string,
    uploadPreset: string,
  ): ResultAsync<UploadResult, DomainError>;

  /**
   * Gets the default avatar URL
   * @returns string
   */
  getDefaultAvatarUrl(): string;

  /**
   * Extracts the public ID from a Cloudinary URL
   * @param url - The Cloudinary URL
   * @returns string | null - The public ID or null if not found
   */
  extractPublicIdFromUrl(url: string): string | null;
}
