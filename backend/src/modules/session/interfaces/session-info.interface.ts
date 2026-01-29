/**
 * Interface for session information
 * Defines the contract for session data returned to users
 */
export interface ISessionInfo {
  sessionId: string;
  deviceName?: string;
  deviceType?: string;
  browser?: string;
  os?: string;
  ip: string;
  location?: string;
  createdAt: Date;
  lastActiveAt: Date;
}
