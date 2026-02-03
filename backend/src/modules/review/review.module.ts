import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { SessionModule } from '../session/session.module';
import { ImageProcessingModule } from 'src/shared/image-processing/image-processing.module';

// Tokens
import { REVIEW_SERVICE } from './tokens/review.token';

// Services
import { ReviewService } from './review.service';

// Controllers
import {
  ReviewController,
  ProductReviewsController,
  ShopReviewsController,
} from './review.controller';

@Module({
  imports: [
    DatabaseModule,
    AlsModule,
    AuthorizationModule,
    SystemConfigModule,
    SessionModule,
    ImageProcessingModule,
  ],
  providers: [
    {
      provide: REVIEW_SERVICE,
      useClass: ReviewService,
    },
  ],
  controllers: [
    ReviewController,
    ProductReviewsController,
    ShopReviewsController,
  ],
  exports: [REVIEW_SERVICE],
})
export class ReviewModule {}
