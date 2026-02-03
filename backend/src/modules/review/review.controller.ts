import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Inject,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { REVIEW_SERVICE } from './tokens/review.token';
import { IReviewService } from './review.service.interface';
import {
  CreateReviewArgumentDto,
  UpdateReviewArgumentDto,
  CreateReviewReplyArgumentDto,
  UpdateReviewReplyArgumentDto,
  ReviewResponseDto,
  ReviewReplyResponseDto,
  CanReviewResponseDto,
} from './dto';
import { ReviewableOrderItemResponseDto } from './dto/reviewable-order-item-response.dto';
import { ReviewErrorHttpMapper } from './errors/review-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { REVIEW_IMAGE_CONFIG } from 'src/common/pipes/file-validation.config';

// ======================== BUYER REVIEW CONTROLLER ========================

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(
    @Inject(REVIEW_SERVICE)
    private readonly reviewService: IReviewService,
  ) {}

  @Post('images/upload')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('review:create')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({
    summary: 'Upload a review image',
    description:
      'Uploads an image and returns the URL. Use this URL when creating a review. ' +
      'Accepted formats: JPG, PNG, WEBP. Size: 500x500 to 1500x1500 pixels, max 2MB.',
  })
  @ApiResponse({
    status: 200,
    description: 'Image uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        imageUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid image file' })
  uploadReviewImage(
    @UploadedFile(new FileValidationPipe(REVIEW_IMAGE_CONFIG))
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    return this.reviewService.uploadReviewImage(file).match(
      (imageUrl) => ({ imageUrl }),
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('review:create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a review for an order item' })
  @ApiResponse({
    status: 201,
    description: 'Review created',
    type: ReviewResponseDto,
  })
  createReview(
    @Body() dto: CreateReviewArgumentDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewService
      .createReview(
        dto.orderItemId,
        dto.rating,
        dto.content ?? null,
        dto.imageUrls ?? [],
      )
      .match(
        (review) => new ReviewResponseDto(review),
        (error) => {
          throw ReviewErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Get('can-review/:orderItemId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('review:create')
  @ApiOperation({ summary: 'Check if user can review an order item' })
  @ApiParam({ name: 'orderItemId', description: 'Order item ID' })
  @ApiResponse({ status: 200, type: CanReviewResponseDto })
  canReviewOrderItem(
    @Param('orderItemId', new ParseUUIDPipe()) orderItemId: string,
  ): Promise<CanReviewResponseDto> {
    return this.reviewService.canReviewOrderItem(orderItemId).match(
      (result) => new CanReviewResponseDto(result),
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('reviewable-items/:productId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('review:create')
  @ApiOperation({ summary: 'Get reviewable order items for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({ status: 200, type: [ReviewableOrderItemResponseDto] })
  getReviewableItemsForProduct(
    @Param('productId', new ParseUUIDPipe()) productId: string,
  ): Promise<ReviewableOrderItemResponseDto[]> {
    return this.reviewService.getReviewableItemsForProduct(productId).match(
      (items) => items.map((item) => new ReviewableOrderItemResponseDto(item)),
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('my-reviews')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: "Get current user's reviews" })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  getMyReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    items: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.reviewService.getMyReviews(pageNum, limitNum).match(
      (result) => ({
        items: ReviewResponseDto.fromList(result.items),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }),
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Get('order-item/:orderItemId')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get review by order item ID' })
  @ApiParam({ name: 'orderItemId', description: 'Order item ID' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  getReviewByOrderItemId(
    @Param('orderItemId', new ParseUUIDPipe()) orderItemId: string,
  ): Promise<ReviewResponseDto | null> {
    return this.reviewService.getReviewByOrderItemId(orderItemId).match(
      (review) => (review ? new ReviewResponseDto(review) : null),
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('review:update')
  @ApiOperation({ summary: 'Update a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 200, type: ReviewResponseDto })
  updateReview(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReviewArgumentDto,
  ): Promise<ReviewResponseDto> {
    return this.reviewService
      .updateReview(id, dto.rating, dto.content, dto.imageUrls)
      .match(
        (review) => new ReviewResponseDto(review),
        (error) => {
          throw ReviewErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('review:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a review' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({ status: 204, description: 'Review deleted' })
  deleteReview(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.reviewService.deleteReview(id).match(
      () => undefined,
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}

// ======================== PUBLIC PRODUCT REVIEWS CONTROLLER ========================

@ApiTags('Products')
@Controller('products')
export class ProductReviewsController {
  constructor(
    @Inject(REVIEW_SERVICE)
    private readonly reviewService: IReviewService,
  ) {}

  @Get(':productId/reviews')
  @ApiOperation({ summary: 'Get reviews for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'rating',
    required: false,
    type: Number,
    description: 'Filter by star rating (1-5)',
  })
  @ApiQuery({
    name: 'hasContent',
    required: false,
    type: Boolean,
    description: 'Filter reviews with text content',
  })
  @ApiQuery({
    name: 'hasImages',
    required: false,
    type: Boolean,
    description: 'Filter reviews with images',
  })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  getProductReviews(
    @Param('productId', new ParseUUIDPipe()) productId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('rating') rating?: string,
    @Query('hasContent') hasContent?: string,
    @Query('hasImages') hasImages?: string,
  ): Promise<{
    items: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const ratingNum = rating ? parseInt(rating, 10) : undefined;
    const hasContentBool = hasContent === 'true' ? true : undefined;
    const hasImagesBool = hasImages === 'true' ? true : undefined;

    return this.reviewService
      .getProductReviews(
        productId,
        pageNum,
        limitNum,
        ratingNum,
        hasContentBool,
        hasImagesBool,
      )
      .match(
        (result) => ({
          items: ReviewResponseDto.fromList(result.items),
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        }),
        (error) => {
          throw ReviewErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }
}

// ======================== SHOP REVIEW MANAGEMENT CONTROLLER ========================

@ApiTags('Shop - Reviews')
@ApiBearerAuth()
@Controller('shop/reviews')
@UseGuards(AuthGuard)
export class ShopReviewsController {
  constructor(
    @Inject(REVIEW_SERVICE)
    private readonly reviewService: IReviewService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get reviews for my shop' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, type: [ReviewResponseDto] })
  getShopReviews(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{
    items: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return this.reviewService.getShopReviews(pageNum, limitNum).match(
      (result) => ({
        items: ReviewResponseDto.fromList(result.items),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      }),
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Post(':reviewId/reply')
  @UseGuards(PermissionsGuard)
  @Permissions('review:reply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Reply to a review' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({ status: 201, type: ReviewReplyResponseDto })
  createReply(
    @Param('reviewId', new ParseUUIDPipe()) reviewId: string,
    @Body() dto: CreateReviewReplyArgumentDto,
  ): Promise<ReviewReplyResponseDto> {
    return this.reviewService.createReviewReply(reviewId, dto.content).match(
      (reply) => new ReviewReplyResponseDto(reply),
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Patch(':reviewId/reply')
  @UseGuards(PermissionsGuard)
  @Permissions('review:reply')
  @ApiOperation({ summary: 'Update reply to a review' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({ status: 200, type: ReviewReplyResponseDto })
  updateReply(
    @Param('reviewId', new ParseUUIDPipe()) reviewId: string,
    @Body() dto: UpdateReviewReplyArgumentDto,
  ): Promise<ReviewReplyResponseDto> {
    return this.reviewService.updateReviewReply(reviewId, dto.content).match(
      (reply) => new ReviewReplyResponseDto(reply),
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':reviewId/reply')
  @UseGuards(PermissionsGuard)
  @Permissions('review:reply')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete reply to a review' })
  @ApiParam({ name: 'reviewId', description: 'Review ID' })
  @ApiResponse({ status: 204, description: 'Reply deleted' })
  deleteReply(
    @Param('reviewId', new ParseUUIDPipe()) reviewId: string,
  ): Promise<void> {
    return this.reviewService.deleteReviewReply(reviewId).match(
      () => undefined,
      (error) => {
        throw ReviewErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}
