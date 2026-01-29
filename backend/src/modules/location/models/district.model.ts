/**
 * District Domain Model
 * Represents a district in Vietnam
 */
export class District {
  constructor(
    private readonly _id: string,
    private readonly _provinceId: string,
    private readonly _name: string,
    private readonly _nameEn: string | null,
    private readonly _type: string | null,
    private readonly _nameWithType: string | null,
  ) {}

  get id(): string {
    return this._id;
  }

  get provinceId(): string {
    return this._provinceId;
  }

  get name(): string {
    return this._name;
  }

  get nameEn(): string | null {
    return this._nameEn;
  }

  get type(): string | null {
    return this._type;
  }

  get nameWithType(): string | null {
    return this._nameWithType;
  }
}
