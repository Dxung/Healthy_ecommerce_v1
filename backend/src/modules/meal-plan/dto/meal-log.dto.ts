import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsUUID,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MealType } from 'src/database/typeorm/entities/meal-plan/enums/meal-type.enum';
import { MealSourceType } from 'src/database/typeorm/entities/meal-plan/enums/meal-source-type.enum';
import { DailyMealLog } from '../models/daily-meal-log.model';

export class AddMealFromProductDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  logDate: Date;

  @IsNotEmpty()
  @IsEnum(MealType)
  mealType: MealType;

  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class AddMealFromPresetDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  logDate: Date;

  @IsNotEmpty()
  @IsEnum(MealType)
  mealType: MealType;

  @IsNotEmpty()
  @IsUUID()
  presetId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class AddCustomMealDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  logDate: Date;

  @IsNotEmpty()
  @IsEnum(MealType)
  mealType: MealType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  foodName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  servingSize?: number;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  servingUnit?: string;

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
  carbs?: number;

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
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class AddQuickMealDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  logDate: Date;

  @IsNotEmpty()
  @IsEnum(MealType)
  mealType: MealType;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  foodName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  calories: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateMealLogDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0.1)
  @Type(() => Number)
  quantity: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class MealLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  logDate: Date;

  @ApiProperty({ enum: MealType })
  mealType: MealType;

  @ApiProperty({ enum: MealSourceType })
  sourceType: MealSourceType;

  @ApiPropertyOptional({ nullable: true })
  productId: string | null;

  @ApiPropertyOptional({ nullable: true })
  presetId: string | null;

  @ApiProperty()
  foodName: string;

  @ApiProperty()
  quantity: number;

  @ApiPropertyOptional({ nullable: true })
  servingSizeSnapshot: number | null;

  @ApiPropertyOptional({ nullable: true })
  servingUnitSnapshot: string | null;

  @ApiProperty()
  caloriesLogged: number;

  @ApiPropertyOptional({ nullable: true })
  proteinLogged: number | null;

  @ApiPropertyOptional({ nullable: true })
  carbsLogged: number | null;

  @ApiPropertyOptional({ nullable: true })
  fatLogged: number | null;

  @ApiPropertyOptional({ nullable: true })
  fiberLogged: number | null;

  @ApiPropertyOptional({ nullable: true })
  sugarLogged: number | null;

  @ApiPropertyOptional({ nullable: true })
  sodiumLogged: number | null;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  constructor(log: DailyMealLog) {
    this.id = log.id;
    this.logDate = log.logDate;
    this.mealType = log.mealType;
    this.sourceType = log.sourceType;
    this.productId = log.productId;
    this.presetId = log.presetId;
    this.foodName = log.foodName;
    this.quantity = log.quantity;
    this.servingSizeSnapshot = log.servingSizeSnapshot;
    this.servingUnitSnapshot = log.servingUnitSnapshot;
    this.caloriesLogged = log.caloriesLogged;
    this.proteinLogged = log.proteinLogged;
    this.carbsLogged = log.carbsLogged;
    this.fatLogged = log.fatLogged;
    this.fiberLogged = log.fiberLogged;
    this.sugarLogged = log.sugarLogged;
    this.sodiumLogged = log.sodiumLogged;
    this.notes = log.notes;
    this.createdAt = log.createdAt;
  }
}
