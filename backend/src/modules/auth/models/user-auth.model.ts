import { v7 as uuidv7 } from 'uuid';
import { UserAuthProviderEnum } from '../enums/user_auth.enum';

/**
 * UserAuth Business Model
 *
 * This model contains authentication data and business logic for user authentication methods.
 *
 * Fields:
 *
 * 1. Immutable Fields (set only at creation):
 * - id: Unique identifier — not changeable
 * - userId: Reference to the user this auth belongs to — not changeable
 * - provider: Authentication provider (e.g., 'local', 'google', 'facebook') — not changeable
 * - providerId: Unique identifier from the provider — not changeable
 * - createdAt: Timestamp of auth record creation — not changeable
 *
 * 2. Changeable Fields:
 * - passwordHash: Hashed password (null for OAuth providers) — can be updated for password changes
 *
 * 3. Timestamps:
 * - updatedAt: Timestamp of last update → automatically updated
 */

export class UserAuth {
  constructor(
    private readonly _id: string,
    private readonly _userId: string,
    private readonly _provider: string,
    private readonly _providerId: string,
    private _passwordHash: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Factory method to create a new UserAuth for local phone authentication
   * @param userId UserId of the user that needs to create auth
   * @param passwordHash Hashed password for the new auth
   * @returns New UserAuth instance
   */
  static createNewUserAuthByPhone(
    userId: string,
    passwordHash: string,
  ): UserAuth {
    const newId = uuidv7();
    const now = new Date();
    return new UserAuth(
      newId,
      userId,
      UserAuthProviderEnum.LOCAL,
      userId, // For local auth, providerId can be the same as userId
      passwordHash,
      now,
      now,
    );
  }

  //--------------------CHANGE METHODS ----------------------

  /**
   * Updates the password hash
   * @param newPasswordHash - The new hashed password
   * @notes This method should only be called with already-hashed passwords
   */
  public updatePasswordHash(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }

  /**
   * Checks if this auth method has a password
   * @returns true if passwordHash is set, false otherwise
   */
  public hasPassword(): boolean {
    return this._passwordHash !== null;
  }

  //--------------------GETTER METHODS ----------------------

  public get id(): string {
    return this._id;
  }

  public get userId(): string {
    return this._userId;
  }

  public get provider(): string {
    return this._provider;
  }

  public get providerId(): string {
    return this._providerId;
  }

  public get passwordHash(): string | null {
    return this._passwordHash;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
