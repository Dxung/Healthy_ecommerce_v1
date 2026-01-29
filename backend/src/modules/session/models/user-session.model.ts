import { v7 as uuidv7 } from 'uuid';

/**
 * UserSession Business Model
 *
 * This model contains session data and business logic for user sessions.
 *
 * Fields:
 *
 * 1. Immutable Fields (set only at creation):
 * - id: Unique identifier — not changeable
 * - userId: Reference to the user this session belongs to — not changeable
 * - sessionToken: Unique session token for authentication — not changeable
 * - deviceName: Name of the device (optional) — not changeable
 * - deviceType: Type of device (mobile, desktop, tablet) (optional) — not changeable
 * - browser: Browser name (optional) — not changeable
 * - os: Operating system (optional) — not changeable
 * - ipAddress: IP address of the device — not changeable
 * - location: Geographic location (optional) — not changeable
 * - createdAt: Timestamp of session creation — not changeable
 * - expireAt: Timestamp when session expires — not changeable
 *
 * 2. Changeable Fields:
 * - lastActiveAt: Timestamp of last activity — updated on each request
 *
 * Note: Session tokens should be generated securely and uniquely
 */

export class UserSession {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _sessionToken: string,
    private readonly _deviceName: string | null,
    private readonly _deviceType: string | null,
    private readonly _browser: string | null,
    private readonly _os: string | null,
    private readonly _ipAddress: string,
    private readonly _location: string | null,
    private readonly _createdAt: Date,
    private _lastActiveAt: Date,
    private readonly _expireAt: Date,
  ) {}

  /**
   * Factory method to create a new UserSession instance
   * @param userId - The ID of the user this session belongs to
   * @param sessionToken - Unique session token (should be generated securely)
   * @param ipAddress - IP address of the device
   * @param expirationDurationInDays - Number of days until session expires (default: 30)
   * @param options - Optional device and location information
   * @returns A new UserSession instance
   */
  static createNewSession(
    userId: string,
    sessionToken: string,
    ipAddress: string,
    expirationDurationInDays: number = 30,
    options?: {
      deviceName?: string | null;
      deviceType?: string | null;
      browser?: string | null;
      os?: string | null;
      location?: string | null;
    },
  ): UserSession {
    const newId = uuidv7();
    const now = new Date();
    const expireAt = new Date();
    expireAt.setDate(expireAt.getDate() + expirationDurationInDays);

    return new UserSession(
      newId,
      userId,
      sessionToken,
      options?.deviceName ?? null,
      options?.deviceType ?? null,
      options?.browser ?? null,
      options?.os ?? null,
      ipAddress,
      options?.location ?? null,
      now,
      now, // lastActiveAt starts as same as createdAt
      expireAt,
    );
  }

  //--------------------BUSINESS RULES ----------------------

  /**
   * Checks if the session is expired
   * @returns true if session has expired, false otherwise
   */
  public isExpired(): boolean {
    return new Date() > this._expireAt;
  }

  //--------------------CHANGE METHODS ----------------------

  /**
   * Updates the last active timestamp to current time
   * This should be called whenever the session is used
   */
  public updateLastActive(): void {
    this._lastActiveAt = new Date();
  }

  //--------------------GETTER METHODS ----------------------

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get sessionToken(): string {
    return this._sessionToken;
  }

  public get deviceName(): string | null {
    return this._deviceName;
  }

  public get deviceType(): string | null {
    return this._deviceType;
  }

  public get browser(): string | null {
    return this._browser;
  }

  public get os(): string | null {
    return this._os;
  }

  public get ipAddress(): string {
    return this._ipAddress;
  }

  public get location(): string | null {
    return this._location;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get lastActiveAt(): Date {
    return this._lastActiveAt;
  }

  public get expireAt(): Date {
    return this._expireAt;
  }
}
