/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { CUSTOM_LOG } from 'src/shared/custom-loggers/tokens/custom-logger.token';
import type { ICustomLoggerService } from 'src/shared/custom-loggers/interfaces/custom-logger.service.interface';
import { ExceptionSource } from './exception-source';
// import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { ControllerErrorFormatter } from '../utils/controller-error-formatter.util';
import { ValidationPipeErrorFormatter } from '../utils/validation-pipe-error-formatter.util';
import { SystemErrorFormatter } from '../utils/system-error-formatter.util';

@Catch()
export class GlobalAllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    @Inject(CUSTOM_LOG) private readonly alsCustomLogger: ICustomLoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    if (exception instanceof HttpException) {
      this.handleHttpException(exception, host);
    } else {
      this.handleOtherException(exception, host);
    }
  }

  private handleHttpException(
    exception: HttpException,
    host: ArgumentsHost,
  ): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const status = exception.getStatus(); //Its is status code (different from the statusCode property in the response body (but the same code number))
    const responseBody = exception.getResponse(); //(Include field: statusCode, message, error and maybe rewrited if provide object in the 1st argument of HttpException)
    const requestPath = httpAdapter.getRequestUrl(ctx.getRequest()) as string;
    const requestMethod = httpAdapter.getRequestMethod(
      ctx.getRequest(),
    ) as string;

    const cause: any = exception.cause;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const source = cause?.source;

    switch (source) {
      case ExceptionSource.CONTROLLER:
        this.httpControllerLog(requestPath, requestMethod, exception, cause);
        break;
      case ExceptionSource.VALIDATION_PIPE:
        this.httpValidationPipeLog(
          requestPath,
          requestMethod,
          exception,
          cause,
        );
        break;
      case ExceptionSource.GUARD:
        this.httpGuardLog(requestPath, requestMethod, exception, cause);
        break;
      default: //in case source is undefined or unknown / not handled
        this.httpUnknownSourceLog(requestPath, requestMethod);
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, status);
  }

  private handleOtherException(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const requestPath = httpAdapter.getRequestUrl(ctx.getRequest()) as string;
    const requestMethod = httpAdapter.getRequestMethod(
      ctx.getRequest(),
    ) as string;

    this.alsCustomLogger.error(
      'System exception occurred',
      SystemErrorFormatter.format(exception, {
        endpoint: requestPath,
        method: requestMethod,
      }),
    );

    const responseBody = {
      statusCode: 500,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, 500);
  }

  //---------------------------- Logging Methods ----------------------------

  /**
   * Log for exception from controller
   * @param path The path of the request that caused the exception
   * @param method The HTTP method of the request that caused the exception
   * @param exception The HttpException thrown by the controller
   * @param cause The cause of the exception
   */
  private httpControllerLog(
    path: string,
    method: string,
    exception: HttpException,
    cause: any,
  ) {
    this.alsCustomLogger.error(
      exception.message,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ControllerErrorFormatter.formatDomainErrorWithContext(cause.error, {
        endpoint: path,
        method: method,
      }),
    );
  }

  /**
   * Log for exception from validation pipe
   * @param path The path of the request that caused the exception
   * @param method The HTTP method of the request that caused the exception
   * @param exception The HttpException thrown by the validation pipe
   * @param cause The cause of the exception
   */
  private httpValidationPipeLog(
    path: string,
    method: string,
    exception: HttpException,
    cause: any,
  ) {
    this.alsCustomLogger.error(
      exception.message,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ValidationPipeErrorFormatter.formatWithContext(cause.error?.details, {
        endpoint: path,
        method: method,
      }),
    );
  }

  /**
   * Log for exception from guard
   * @param path The path of the request that caused the exception
   * @param method The HTTP method of the request that caused the exception
   * @param exception The HttpException thrown by the guard
   * @param cause The cause of the exception
   */
  private httpGuardLog(
    path: string,
    method: string,
    exception: HttpException,
    cause: any,
  ) {
    this.alsCustomLogger.error(
      exception.message,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      ControllerErrorFormatter.formatDomainErrorWithContext(cause.error, {
        endpoint: path,
        method: method,
      }),
    );
  }

  /**
   * Log for exception without source traced
   * @param requestPath The path of the request that caused the exception
   * @param requestMethod The HTTP method of the request that caused the exception
   */
  private httpUnknownSourceLog(requestPath: string, requestMethod: string) {
    this.alsCustomLogger.error(
      `Exception happens without source traced.`,
      `Path: ${requestPath}.\n
      Method: ${requestMethod}`,
    );
  }
}
