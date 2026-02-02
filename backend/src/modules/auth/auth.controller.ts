import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import type { IAuthService } from './auth.service.interface';
import { AUTH_SERVICE } from './tokens/auth.token';
import {
  VerifyOtpTokenArgumentDto,
  VerifyOtpTokenResponseDto,
  BuyerRegistrationArgumentDto,
  LoginArgumentDto,
  PasswordResetWithOtpArgumentDto,
  VerifyPasswordResetOtpArgumentDto,
  VerifyPasswordResetOtpResponseDto,
  ChangePasswordArgumentDto,
} from './dto';
import { AuthErrorHttpMapper } from './errors/auth-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { GetDeviceInfo } from 'src/common/decorators/get-device-info.decorator';
import { DeviceInfo } from 'src/common/interfaces/device-infos.interface';
import {
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from '../session/constants/session.constants';
import { AuthGuard } from './guards/auth.guard';

/**
 * Controller responsible for handling authentication-related requests.
 * Route: /auth
 */
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: IAuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Verifies the OTP token for a buyer.
   * @param dto - Data transfer object containing the OTP token to verify.
   * @returns A promise that resolves to the response DTO containing verification results.
   */
  @Post('buyer/verify-otp-token')
  @HttpCode(HttpStatus.OK)
  async verifyBuyerOtpToken(
    @Body() dto: VerifyOtpTokenArgumentDto,
  ): Promise<VerifyOtpTokenResponseDto> {
    return this.authService.verifyBuyerOtpToken(dto.token).match(
      (result) => new VerifyOtpTokenResponseDto(result),
      (error) => {
        throw AuthErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Registers a new buyer using phone number.
   * @param dto - Data transfer object containing registration details.
   * @param deviceInfo - Information about the device making the request.
   * @param response - Express response object for setting cookies.
   * @returns A promise that resolves when registration is complete (sessionToken set as cookie).
   */
  @Post('buyer/register-with-phone')
  @HttpCode(HttpStatus.CREATED)
  async registerBuyerWithPhone(
    @Body() dto: BuyerRegistrationArgumentDto,
    @GetDeviceInfo() deviceInfo: DeviceInfo,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    return this.authService
      .registerBuyerWithPhone(dto.token, dto.username, dto.password, deviceInfo)
      .match(
        (result) => {
          // Set sessionToken as HTTP-only cookie
          const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
          response.cookie(SESSION_COOKIE_NAME, result.sessionToken, {
            httpOnly: true,
            secure:
              this.configService.get<string>('NODE_ENV')?.trim() ===
              'production',
            sameSite: 'lax',
            maxAge: SESSION_COOKIE_MAX_AGE,
            ...(cookieDomain && { domain: cookieDomain }),
          });
        },
        (error) => {
          throw AuthErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Authenticates a user with login ID and password.
   * @param dto - Data transfer object containing login credentials.
   * @param deviceInfo - Information about the device making the request.
   * @param response - Express response object for setting cookies.
   * @returns A promise that resolves when login is complete (sessionToken set as cookie).
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginWithPassword(
    @Body() dto: LoginArgumentDto,
    @GetDeviceInfo() deviceInfo: DeviceInfo,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    return this.authService
      .loginWithPassword(dto.loginId, dto.password, deviceInfo)
      .match(
        (result) => {
          // Set sessionToken as HTTP-only cookie
          const cookieDomain = this.configService.get<string>('COOKIE_DOMAIN');
          response.cookie(SESSION_COOKIE_NAME, result.sessionToken, {
            httpOnly: true,
            secure:
              this.configService.get<string>('NODE_ENV')?.trim() ===
              'production',
            sameSite: 'lax',
            maxAge: SESSION_COOKIE_MAX_AGE,
            ...(cookieDomain && { domain: cookieDomain }),
          });
        },
        (error) => {
          throw AuthErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Verifies OTP for password reset and returns internal token.
   * Flow:
   * 1. User receives OTP via on their phone
   * 2. User verifies OTP with Firebase and gets Firebase token
   * 3. User sends Firebase token to this endpoint
   * 4. Backend verifies Firebase token, checks phone is registered, creates internal token
   * @param dto - Data transfer object containing Firebase token.
   * @returns A promise that resolves to internal token for password reset.
   */
  @Post('password-reset/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyPasswordResetOtp(
    @Body() dto: VerifyPasswordResetOtpArgumentDto,
  ): Promise<VerifyPasswordResetOtpResponseDto> {
    return this.authService.verifyPasswordResetOtp(dto.token).match(
      (result) => new VerifyPasswordResetOtpResponseDto(result),
      (error) => {
        throw AuthErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Resets user password using internal password-reset token.
   * Flow:
   * 1. User verifies OTP and gets internal token from verify-otp endpoint
   * 2. User sends internal token + new password to this endpoint
   * 3. Backend verifies internal token, extracts phone, updates password, and clears all sessions
   * @param dto - Data transfer object containing internal token and new password.
   * @returns A promise that resolves when password is successfully reset (204 No Content).
   */
  @Post('password-reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPasswordWithOtp(
    @Body() dto: PasswordResetWithOtpArgumentDto,
  ): Promise<void> {
    return this.authService
      .resetPasswordWithOtp(dto.token, dto.newPassword)
      .match(
        () => undefined,
        (error) => {
          throw AuthErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Logs out the current user by deleting their session.
   * Requires authentication (AuthGuard sets sessionId in ALS).
   * Clears the sessionToken cookie on success.
   * @param response - Express response object for clearing cookies.
   * @returns A promise that resolves when logout is complete (204 No Content).
   */
  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Res({ passthrough: true }) response: Response): Promise<void> {
    return this.authService.logout().match(
      () => {
        // Clear sessionToken cookie
        response.clearCookie(SESSION_COOKIE_NAME);
      },
      (error) => {
        throw AuthErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  /**
   * Changes the current user's password.
   * Requires authentication (AuthGuard sets userId in ALS).
   * Verifies current password before updating to new password.
   * @param dto - Data transfer object containing current and new passwords.
   * @returns A promise that resolves when password is successfully changed (200 OK).
   */
  @Patch('change-password')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Body() dto: ChangePasswordArgumentDto): Promise<void> {
    return this.authService
      .changePassword(dto.currentPassword, dto.newPassword)
      .match(
        () => undefined,
        (error) => {
          throw AuthErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  /**
   * Gets the password last updated timestamp for the current authenticated user.
   * Requires authentication (AuthGuard sets userId in ALS).
   * @returns A promise that resolves to an object containing the password update timestamp.
   */
  @Get('password-updated-at')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getPasswordUpdatedAt(): Promise<{ updatedAt: Date | null }> {
    return this.authService.getPasswordUpdatedAt().match(
      (updatedAt) => ({ updatedAt }),
      (error) => {
        throw AuthErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}
