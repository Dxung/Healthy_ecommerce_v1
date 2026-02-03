export interface FileValidationConfig {
  maxSizeInMB: number;
  allowedMimeTypes: string[];
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
}

export const AVATAR_IMAGE_CONFIG: FileValidationConfig = {
  maxSizeInMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  minWidth: 150,
  maxWidth: 2000,
  minHeight: 150,
  maxHeight: 2000,
};

export const PRODUCT_IMAGE_CONFIG: FileValidationConfig = {
  maxSizeInMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  minWidth: 500,
  maxWidth: 1200,
  minHeight: 500,
  maxHeight: 1200,
};

export const REVIEW_IMAGE_CONFIG: FileValidationConfig = {
  maxSizeInMB: 2,
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  minWidth: 500,
  maxWidth: 1500,
  minHeight: 500,
  maxHeight: 1500,
};
