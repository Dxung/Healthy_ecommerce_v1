import { v7 as uuidv7 } from 'uuid';

/**
 * Domain model for Category.
 * Supports 3-level hierarchy via parentId.
 */
export class Category {
  private _children: Category[] = [];

  constructor(
    private readonly _id: string,
    private readonly _parentId: string | null,
    private _name: string,
    private _slug: string,
    private _iconUrl: string | null,
    private readonly _level: number,
    private _isActive: boolean,
    private _sortOrder: number,
    private readonly _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
    children: Category[] = [],
  ) {
    this._children = children;
  }

  // ======================== FACTORY METHODS ========================

  /**
   * Creates a new category.
   */
  static create(params: {
    parentId: string | null;
    name: string;
    slug: string;
    iconUrl?: string | null;
    level: number;
    sortOrder?: number;
  }): Category {
    const now = new Date();
    return new Category(
      uuidv7(),
      params.parentId,
      params.name,
      params.slug,
      params.iconUrl ?? null,
      params.level,
      true, // isActive
      params.sortOrder ?? 0,
      now,
      now,
      null,
      [],
    );
  }

  /**
   * Creates a root category (level 1).
   */
  static createRoot(
    name: string,
    slug: string,
    iconUrl?: string,
    sortOrder?: number,
  ): Category {
    return Category.create({
      parentId: null,
      name,
      slug,
      iconUrl,
      level: 1,
      sortOrder,
    });
  }

  // ======================== BUSINESS RULES ========================

  /**
   * Checks if this category can have children (level < 3).
   */
  canHaveChildren(): boolean {
    return this._level < 3;
  }

  /**
   * Checks if this is a leaf category (level 3).
   */
  isLeafCategory(): boolean {
    return this._level === 3;
  }

  /**
   * Checks if this is a root category (no parent).
   */
  isRootCategory(): boolean {
    return this._parentId === null;
  }

  /**
   * Gets the child level for new subcategories.
   */
  getChildLevel(): number {
    return this._level + 1;
  }

  // ======================== UPDATE METHODS ========================

  updateInfo(name: string, slug: string, iconUrl?: string | null): void {
    this._name = name;
    this._slug = slug;
    if (iconUrl !== undefined) {
      this._iconUrl = iconUrl;
    }
    this._updatedAt = new Date();
  }

  updateSortOrder(sortOrder: number): void {
    this._sortOrder = sortOrder;
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

  setChildren(children: Category[]): void {
    this._children = children;
  }

  // ======================== GETTERS ========================

  get id(): string {
    return this._id;
  }

  get parentId(): string | null {
    return this._parentId;
  }

  get name(): string {
    return this._name;
  }

  get slug(): string {
    return this._slug;
  }

  get iconUrl(): string | null {
    return this._iconUrl;
  }

  get level(): number {
    return this._level;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  get deletedAt(): Date | null {
    return this._deletedAt;
  }

  get children(): Category[] {
    return this._children;
  }
}
