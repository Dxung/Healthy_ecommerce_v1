import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryImageService } from './cloudinary-image.service';
import { imageProcessingConfig } from './image-processing.config';
import { IMAGE_PROCESSING_SERVICE } from './tokens/image-processing.token';

@Module({
  imports: [ConfigModule.forFeature(imageProcessingConfig)],
  providers: [
    {
      provide: IMAGE_PROCESSING_SERVICE,
      useClass: CloudinaryImageService,
    },
  ],
  exports: [IMAGE_PROCESSING_SERVICE],
})
export class ImageProcessingModule {}
