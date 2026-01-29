import { ISessionInfo } from '../../interfaces/session-info.interface';

/**
 * Response DTO containing session information for display
 * Used when returning session details to the user
 * Implements ISessionInfo interface
 */
export class SessionInfoResponseDto implements ISessionInfo {
  sessionId: string;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ip: string;
  location?: string;
  createdAt: Date;
  lastActiveAt: Date;

  constructor(
    sessionId: string,
    ip: string,
    createdAt: Date,
    lastActiveAt: Date,
    deviceName?: string,
    deviceType?: string,
    browser?: string,
    os?: string,
    location?: string,
  ) {
    this.sessionId = sessionId;
    this.ip = ip;
    this.createdAt = createdAt;
    this.lastActiveAt = lastActiveAt;
    this.deviceName = deviceName;
    this.deviceType = deviceType;
    this.browser = browser;
    this.os = os;
    this.location = location;
  }
}
