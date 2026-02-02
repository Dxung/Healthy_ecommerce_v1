import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsEnum,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PresetSource } from 'src/database/typeorm/entities/meal-plan/enums/preset-source.enum';
import { VoteType } from 'src/database/typeorm/entities/meal-plan/enums/vote-type.enum';
import { FoodPreset } from '../models/food-preset.model';

export class CreatePresetDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  servingSize: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  servingUnit: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  calories: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  protein?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  carbohydrates?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fat?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fiber?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sugar?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sodium?: number;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;
}

export class UpdatePresetDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  servingSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  servingUnit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  calories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  protein?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  carbohydrates?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fat?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  fiber?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sugar?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  sodium?: number;
}

export class VotePresetDto {
  @IsNotEmpty()
  @IsEnum(VoteType)
  voteType: VoteType;
}

export class PresetResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  creatorId: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  description: string | null;

  @ApiPropertyOptional({ nullable: true })
  imageUrl: string | null;

  @ApiProperty()
  servingSize: number;

  @ApiProperty()
  servingUnit: string;

  @ApiProperty()
  calories: number;

  @ApiPropertyOptional({ nullable: true })
  protein: number | null;

  @ApiPropertyOptional({ nullable: true })
  carbohydrates: number | null;

  @ApiPropertyOptional({ nullable: true })
  fat: number | null;

  @ApiPropertyOptional({ nullable: true })
  fiber: number | null;

  @ApiPropertyOptional({ nullable: true })
  sugar: number | null;

  @ApiPropertyOptional({ nullable: true })
  sodium: number | null;

  @ApiProperty({ enum: PresetSource })
  source: PresetSource;

  @ApiProperty()
  isPublic: boolean;

  @ApiProperty()
  upvoteCount: number;

  @ApiProperty()
  downvoteCount: number;

  @ApiProperty()
  useCount: number;

  @ApiProperty()
  netVotes: number;

  @ApiProperty()
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Current user vote',
    nullable: true,
    enum: VoteType,
  })
  userVote?: VoteType | null;

  @ApiPropertyOptional({ description: 'Is favorited by current user' })
  isFavorite?: boolean;

  constructor(
    preset: FoodPreset,
    userVote?: VoteType | null,
    isFavorite?: boolean,
  ) {
    this.id = preset.id;
    this.creatorId = preset.creatorId;
    this.name = preset.name;
    this.description = preset.description;
    this.imageUrl = preset.imageUrl;
    this.servingSize = preset.servingSize;
    this.servingUnit = preset.servingUnit;
    this.calories = preset.calories;
    this.protein = preset.protein;
    this.carbohydrates = preset.carbohydrates;
    this.fat = preset.fat;
    this.fiber = preset.fiber;
    this.sugar = preset.sugar;
    this.sodium = preset.sodium;
    this.source = preset.source;
    this.isPublic = preset.isPublic;
    this.upvoteCount = preset.upvoteCount;
    this.downvoteCount = preset.downvoteCount;
    this.useCount = preset.useCount;
    this.netVotes = preset.getNetVotes();
    this.createdAt = preset.createdAt;
    this.userVote = userVote;
    this.isFavorite = isFavorite;
  }
}
