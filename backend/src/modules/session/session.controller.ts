import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SESSION_SERVICE } from './tokens/session.token';
import type { ISessionService } from './session.service.interface';
import { DeleteSelectedSessionDto } from './dto/argumentDTO/delete-selected-session.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { PermissionsGuard } from '../authorization/guards/permissions.guard';
import { Permissions } from '../authorization/decorators/permissions.decorator';
import { SessionErrorHttpMapper } from './errors/session-errors-http.mapper';
import { ExceptionSource } from 'src/common/exception filters/exception-source';
import { SessionInfoResponseDto } from './dto/responseDTO/session-info-response.dto';

@Controller('sessions')
export class SessionController {
  constructor(
    @Inject(SESSION_SERVICE)
    private readonly sessionService: ISessionService,
  ) {}

  @Get('all-of-current-user')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('session:read')
  getAllCurrentUserSessions(): Promise<SessionInfoResponseDto[]> {
    return this.sessionService.getAllCurrentUserSessions().match(
      (sessions) =>
        sessions.map(
          (session) =>
            new SessionInfoResponseDto(
              session.sessionId,
              session.ip,
              session.createdAt,
              session.lastActiveAt,
              session.deviceName,
              session.deviceType,
              session.browser,
              session.os,
              session.location,
            ),
        ),
      (error) => {
        throw SessionErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }

  @Delete(':selectedSessionId')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('session:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteSelectedSession(@Param() dto: DeleteSelectedSessionDto): Promise<void> {
    return this.sessionService
      .deleteSelectedSession(dto.selectedSessionId)
      .match(
        () => undefined,
        (error) => {
          throw SessionErrorHttpMapper.toHttpException(
            error,
            ExceptionSource.CONTROLLER,
          );
        },
      );
  }

  @Delete('all-other')
  @UseGuards(AuthGuard, PermissionsGuard)
  @Permissions('session:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteAllOtherSessions(): Promise<void> {
    return this.sessionService.deleteAllOtherSessions().match(
      () => undefined,
      (error) => {
        throw SessionErrorHttpMapper.toHttpException(
          error,
          ExceptionSource.CONTROLLER,
        );
      },
    );
  }
}
