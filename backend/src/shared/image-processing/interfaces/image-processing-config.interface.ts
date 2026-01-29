/**
 * Configuration interfaces for image processing service
 * These types are used in image-processing.config.ts
 */

/**
 * Cloudinary service configuration
 * Retrieved from environment variables via NestJS ConfigService
 *
 * Environment variables:
 * - CLOUDINARY_CLOUD_NAME: Your Cloudinary cloud name
 * - CLOUDINARY_API_KEY: Your Cloudinary API key
 * - CLOUDINARY_API_SECRET: Your Cloudinary API secret
 */
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

/**
 * Image validation configuration
 * Defines file size limits and allowed MIME types
 */
export interface ValidationConfig {
  maxFileSize: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
}

/**
 * Complete image processing configuration
 * Used as the return type for imageProcessingConfig
 */
export interface ImageProcessingConfig {
  cloudinary: CloudinaryConfig;
  validation: ValidationConfig;
  defaultAvatarUrl: string;
}
