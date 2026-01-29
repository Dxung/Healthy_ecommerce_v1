import { v7 as uuidv7 } from 'uuid';
import { Permission } from './permission.model';

export class Role {
  private constructor(
    private readonly _id: string,
    private _roleName: string,
    private _description: string | null,
    private _isActive: boolean,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _permissions: Permission[] = [],
  ) {}

  /**
   * Create a new role
   */
  static create(params: {
    roleName: string;
    description?: string | null;
  }): Role {
    const id = uuidv7();
    const now = new Date();

    return new Role(
      id,
      params.roleName,
      params.description ?? null,
      true, // isActive default to true
      now,
      now,
      [],
    );
  }

  /**
   * Reconstruct from persistence
   */
  static fromPersistence(params: {
    id: string;
    roleName: string;
    description: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    permissions?: Permission[];
  }): Role {
    return new Role(
      params.id,
      params.roleName,
      params.description,
      params.isActive,
      params.createdAt,
      params.updatedAt,
      params.permissions ?? [],
    );
  }

  // Methods
  updateInfo(roleName: string, description: string | null): void {
    this._roleName = roleName;
    this._description = description;
    this._updatedAt = new Date();
  }

  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  setPermissions(permissions: Permission[]): void {
    this._permissions = permissions;
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get roleName(): string {
    return this._roleName;
  }

  get description(): string | null {
    return this._description;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get permissions(): Permission[] {
    return this._permissions;
  }
}
