import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { IUserService } from './user.service.interface';
import { USER_SERVICE } from './tokens/user.token';
import { FileValidationPipe } from 'src/common/pipes/file-validation.pipe';
import { AVATAR_IMAGE_CONFIG } from 'src/common/pipes/file-validation.config';
import {
  AddressResponseDto,
  AvatarResponseDto,
  CheckUsernameArgumentDto,
  CheckUsernameResponseDto,
  CreateAddressArgumentDto,
  ProfileResponseDto,
  UpdateAddressArgumentDto,
  UpdateProfileArgumentDto,
  UpdatePhoneWithOtpArgumentDto,
} from './dto';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { UserErrorHttpMapper } from './errors/user-errors-http.mapper';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AUTHORIZATION_SERVICE } from '../authorization/tokens/authorization.token';
import type { IAuthorizationService } from '../authorization/authorization.service.interface';

/**
 * Controller responsible for handling user-related requests.
 * Route: /user
 */
@Controller('user')
export class UserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
    @Inject(AUTHORIZATION_SERVICE)
    private readonly authorizationService: IAuthorizationService,
  ) {}

  //================================================== USERNAME VALIDATION ==================================================
  /**
   * Checks if a username is available for registration.
   * This endpoint is public (no auth required) for the signup flow.
   * @param dto - Data transfer object containing the username to check.
   * @returns A promise that resolves to the response DTO indicating availability.
   */
  @Post('check-username')
  @HttpCode(HttpStatus.OK)
  async checkUsername(
    @Body() dto: CheckUsernameArgumentDto,
  ): Promise<CheckUsernameResponseDto> {
    return this.userService.checkUsernameAvailability(dto.username).match(
      (available) => new CheckUsernameResponseDto(available),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== USER PROFILE ==================================================
  /**
   * Gets the current authenticated user's information.
   * This endpoint requires authentication (AuthGuard).
   * @returns A promise that resolves to the response DTO containing full profile data with masked sensitive information.
   */
  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(): Promise<ProfileResponseDto> {
    return this.userService
      .getCurrentUser()
      .andThen((user) =>
        this.authorizationService
          .getUserRoles(user.id)
          .map((roles) => ({ user, roles })),
      )
      .match(
        ({ user, roles }) => new ProfileResponseDto(user, roles),
        (error) => {
          throw UserErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Updates the current user's profile.
   * This endpoint requires authentication (AuthGuard).
   * If DTO is empty, returns success immediately. Otherwise, updates the specified fields.
   * @param dto - UpdateProfileArgumentDto with optional fields (fullName, dateOfBirth, gender)
   * @returns A promise that resolves to void on success.
   */
  @Patch('update-my-profile')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateProfile(@Body() dto: UpdateProfileArgumentDto): Promise<void> {
    return this.userService.updateProfile(dto).match(
      () => undefined,
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Updates the current user's phone number using Firebase OTP verification.
   * This endpoint requires authentication (AuthGuard).
   * Validates phone format, checks for duplicates, and updates the phone number.
   * @param dto - UpdatePhoneWithOtpArgumentDto containing Firebase token
   * @returns A promise that resolves to void on success.
   */
  @Patch('update-phone')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updatePhone(@Body() dto: UpdatePhoneWithOtpArgumentDto): Promise<void> {
    return this.userService.updatePhoneWithOtp(dto.token).match(
      () => undefined,
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== USER'S ADDRESS ==================================================
  /**
   * Gets all addresses for the current authenticated user.
   * Fetches location names for each address to build full response.
   * @returns Promise that resolves to array of AddressResponseDto
   */
  @Get('addresses')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getAllAddresses(): Promise<AddressResponseDto[]> {
    return this.userService.getAllAddresses().match(
      (addressesWithLocationNames) =>
        addressesWithLocationNames.map(
          ({ address, locationNames }) =>
            new AddressResponseDto(address, locationNames),
        ),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Creates a new address for the current authenticated user.
   * @param dto - CreateAddressArgumentDto with address details
   * @returns Promise that resolves to AddressResponseDto
   */
  @Post('addresses')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createAddress(
    @Body() dto: CreateAddressArgumentDto,
  ): Promise<AddressResponseDto> {
    return this.userService.createAddress(dto).match(
      ({ address, locationNames }) =>
        new AddressResponseDto(address, locationNames),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Updates an existing address.
   * @param addressId - The address ID to update
   * @param dto - UpdateAddressArgumentDto with fields to update
   * @returns Promise that resolves to AddressResponseDto
   */
  @Patch('addresses/:addressId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async updateAddress(
    @Param('addressId') addressId: string,
    @Body() dto: UpdateAddressArgumentDto,
  ): Promise<AddressResponseDto> {
    return this.userService.updateAddress(addressId, dto).match(
      ({ address, locationNames }) =>
        new AddressResponseDto(address, locationNames),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Deletes an address.
   * @param addressId - The address ID to delete
   * @returns Promise that resolves to void
   */
  @Delete('addresses/:addressId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteAddress(@Param('addressId') addressId: string): Promise<void> {
    return this.userService.deleteAddress(addressId).match(
      () => undefined,
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Sets an address as the default.
   * @param addressId - The address ID to set as default
   * @returns Promise that resolves to void
   */
  @Patch('addresses/:addressId/set-default')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async setDefaultAddress(
    @Param('addressId') addressId: string,
  ): Promise<void> {
    return this.userService.setDefaultAddress(addressId).match(
      () => undefined,
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  //================================================== USER'S AVATAR ==================================================
  /**
   * Uploads a new avatar for the current user.
   * Accepts multipart/form-data with file field name 'avatar'.
   * Max file size: 2MB (validated by FileValidationPipe).
   * Allowed formats: JPG, PNG, WEBP.
   * Image dimensions: 150x150 to 2000x2000 pixels.
   * @param file - The uploaded file from multer (validated and guaranteed to exist)
   * @returns Promise that resolves to AvatarResponseDto with new avatar URL
   */
  @Post('avatar')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @HttpCode(HttpStatus.OK)
  async uploadAvatar(
    @UploadedFile(new FileValidationPipe(AVATAR_IMAGE_CONFIG))
    file: Express.Multer.File,
  ): Promise<AvatarResponseDto> {
    return this.userService.uploadAvatar(file).match(
      (avatarUrl) => new AvatarResponseDto(avatarUrl),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Deletes the current user's avatar and reverts to default.
   * @returns Promise that resolves to AvatarResponseDto with default avatar URL
   */
  @Delete('avatar')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async deleteAvatar(): Promise<AvatarResponseDto> {
    return this.userService.deleteAvatar().match(
      (avatarUrl) => new AvatarResponseDto(avatarUrl),
      (error) => {
        throw UserErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}
