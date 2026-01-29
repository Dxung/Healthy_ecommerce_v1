import { v7 as uuidv7 } from 'uuid';

export class Permission {
  private constructor(
    private readonly _id: string,
    private readonly _permissionName: string,
    private readonly _resource: string,
    private readonly _action: string,
    private _description: string | null,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  /**
   * Create a new permission
   * permissionName is auto-generated as "resource:action"
   */
  static create(params: {
    resource: string;
    action: string;
    description?: string | null;
  }): Permission {
    const id = uuidv7();
    const now = new Date();
    const permissionName = `${params.resource}:${params.action}`;

    return new Permission(
      id,
      permissionName,
      params.resource,
      params.action,
      params.description ?? null,
      now,
      now,
    );
  }

  /**
   * Reconstruct from persistence
   */
  static fromPersistence(params: {
    id: string;
    permissionName: string;
    resource: string;
    action: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Permission {
    return new Permission(
      params.id,
      params.permissionName,
      params.resource,
      params.action,
      params.description,
      params.createdAt,
      params.updatedAt,
    );
  }

  // Methods
  updateDescription(description: string | null): void {
    this._description = description;
    this._updatedAt = new Date();
  }

  // Getters
  get id(): string {
    return this._id;
  }

  get permissionName(): string {
    return this._permissionName;
  }

  get resource(): string {
    return this._resource;
  }

  get action(): string {
    return this._action;
  }

  get description(): string | null {
    return this._description;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }
}
