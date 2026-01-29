import { registerAs } from '@nestjs/config';
import type { ImageProcessingConfig } from './interfaces/image-processing-config.interface';

export const imageProcessingConfig = registerAs(
  'imageProcessing',
  (): ImageProcessingConfig => ({
    // Cloudinary configuration
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    },
    // Image validation rules
    validation: {
      maxFileSize: 2 * 1024 * 1024, // 2MB in bytes
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
    },
    // Default avatar URL
    defaultAvatarUrl: process.env.DEFAULT_AVATAR_URL || '',
  }),
);
