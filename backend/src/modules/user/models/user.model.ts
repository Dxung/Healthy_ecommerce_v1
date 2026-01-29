import { Gender } from '../enums/gender.enum';
import { UserStatus } from '../enums/user-status.enum';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { USER_ERRORS } from '../errors/user.errors';
import { err, ok, Result } from 'neverthrow';
import { v7 as uuidv7 } from 'uuid';

/**
 * User Business Model
 *
 * This model contains only the data and business logic relevant to the business.
 *
 * Fields:
 *
 * 1. Immutable Fields (set only at creation):
 * - id: Unique identifier — not changeable
 * - createdAt: Timestamp of user creation — not changeable
 *
 * 2. Fields that can be changed only once:
 * - username: Unique Username, is created randomly and automatically at registration and can be changed only once
 * - dateOfBirth: null at registration, can be set only once
 * - gender: null at registration, can be set only once
 *
 * 3. Null at registration and changeable anytime fields:
 * - fullname: Can be null at registration, can be changed anytime
 * - email: Can be null at registration (with phone), must be replaced (not removed)
 * - phoneNumber: Can be null at registration (with email), must be replaced (not removed)
 *
 * 4. Always changeable fields:
 * - avatarUrl: Required field (NOT NULL) and changeable anytime
 * - status: has default value ACTIVE, can be changed anytime
 *
 * 5. Timestamps:
 * - usernameChangedAt: Null at creation, get time when "username" was changed
 * - dateOfBirthChangedAt: Null at creation, get time when "date of birth" was changed
 * - genderChangedAt: Null at creation, get time when "gender" was changed
 * - deletedAt: Timestamp of deletion → not directly settable
 * - updatedAt: Timestamp of last update → not directly settable

 */

export class User {
  constructor(
    private readonly _id: string,
    private readonly _createdAt: Date,
    private readonly _username: string,
    private _dateOfBirth: Date | null,
    private _gender: Gender | null,
    private _fullName: string | null,
    private _email: string | null,
    private _phoneNumber: string | null,
    private _avatarUrl: string,
    private _status: UserStatus = UserStatus.ACTIVE,
    private _dateOfBirthChangedAt: Date | null,
    private _genderChangedAt: Date | null,
    private _deletedAt: Date | null,
    private _updatedAt: Date,
  ) {}

  static createNewUser(
    username: string,
    avatarUrl: string,
    options?: {
      dateOfBirth?: Date;
      gender?: Gender;
      fullName?: string;
      email?: string;
      phoneNumber?: string;
      status?: UserStatus;
    },
  ) {
    const newId = uuidv7();
    const newCreatedAt = new Date();
    return new User(
      newId,
      newCreatedAt,
      username,
      options?.dateOfBirth ?? null,
      options?.gender ?? null,
      options?.fullName ?? null,
      options?.email ?? null,
      options?.phoneNumber ?? null,
      avatarUrl,
      options?.status ?? UserStatus.ACTIVE,
      null,
      null,
      null,
      newCreatedAt,
    );
  }

  //--------------------BUSINESS RULES ----------------------

  /**
   * Function to validate dateofbirth format
   * @returns true if date of birth has never changed before, false otherwise
   */
  public canChangeDateOfBirth(): boolean {
    return this._dateOfBirthChangedAt === null;
  }

  /**
   * Function to validate gender format
   * @returns true if gender has never changed before, false otherwise
   */
  public canChangeGender(): boolean {
    return this._genderChangedAt === null;
  }

  //--------------------CHANGE METHODS ----------------------

  /**
   * Changes the date of birth if meets business rules
   * @param newDateOfBirth - The new date of birth to change
   * @returns Return a void Ok result if successful, or a UserErrorType Err result if not allowed
   */
  public changeDateOfBirth(newDateOfBirth: Date): Result<void, DomainError> {
    if (!this.canChangeDateOfBirth()) {
      return err(
        createDomainError(USER_ERRORS.DATE_OF_BIRTH_ALREADY_CHANGED, {
          cause: USER_ERRORS.DATE_OF_BIRTH_ALREADY_CHANGED.message,
        }),
      );
    }
    this._dateOfBirth = newDateOfBirth;
    this._dateOfBirthChangedAt = new Date();
    this._updatedAt = new Date();
    return ok();
  }

  /**
   * Changes the gender if meets business rules
   * @param newGender - the new gender to change
   * @returns Return a void Ok result if successful, or a UserErrorType Err result if not allowed
   */
  public changeGender(newGender: Gender): Result<void, DomainError> {
    if (!this.canChangeGender()) {
      return err(
        createDomainError(USER_ERRORS.GENDER_ALREADY_CHANGED, {
          cause: USER_ERRORS.GENDER_ALREADY_CHANGED.message,
        }),
      );
    }
    this._gender = newGender;
    this._genderChangedAt = new Date();
    this._updatedAt = new Date();
    return ok();
  }

  /**
   * Changes the full name of user
   * @param newFullName - The new full name to set
   * @notes if new full name is same as old full name, no changes are made.
   */
  public changeFullName(newFullName: string): void {
    if (newFullName === this._fullName) {
      return;
    }
    this._fullName = newFullName;
    this._updatedAt = new Date();
  }

  /**
   * Changes the email of user
   * @param newEmail - The new email to set
   * @notes if new email is same as old email, no changes are made.
   */
  public changeEmail(newEmail: string): void {
    if (newEmail === this._email) {
      return;
    }
    this._email = newEmail;
    this._updatedAt = new Date();
  }

  /**
   * Changes the phone number of user
   * @param newPhoneNumber - The new phone number to set
   */
  public changePhoneNumber(newPhoneNumber: string): void {
    if (newPhoneNumber === this._phoneNumber) {
      return;
    }
    this._phoneNumber = newPhoneNumber;
    this._updatedAt = new Date();
  }

  /**
   * Changes the avatar URL of user
   * @param newAvatarUrl - The new avatar URL to set
   */
  public changeAvatarUrl(newAvatarUrl: string): void {
    this._avatarUrl = newAvatarUrl;
    this._updatedAt = new Date();
  }

  /**
   * Changes the status of the user
   * @param newStatus - The new status to set
   * @returns object indicating success or failure with message
   */
  public changeStatus(newStatus: UserStatus): void {
    this._status = newStatus;
    this._updatedAt = new Date();
  }

  /**
   * Checks if user has at least one contact method (email or phone number)
   * @returns true if at least one contact method is present, false otherwise
   */
  public hasContactMethods(): boolean {
    return this._email !== null || this._phoneNumber !== null;
  }

  //--------------------GETTER METHODS ----------------------
  public get id(): string {
    return this._id;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get username(): string {
    return this._username;
  }

  public get dateOfBirth(): Date | null {
    return this._dateOfBirth;
  }

  public get gender(): Gender | null {
    return this._gender;
  }

  public get fullName(): string | null {
    return this._fullName;
  }

  public get email(): string | null {
    return this._email;
  }
  public get phoneNumber(): string | null {
    return this._phoneNumber;
  }

  public get avatarUrl(): string {
    return this._avatarUrl;
  }

  public get status(): UserStatus {
    return this._status;
  }

  public get dateOfBirthChangedAt(): Date | null {
    return this._dateOfBirthChangedAt;
  }

  public get genderChangedAt(): Date | null {
    return this._genderChangedAt;
  }

  public get deletedAt(): Date | null {
    return this._deletedAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
}
