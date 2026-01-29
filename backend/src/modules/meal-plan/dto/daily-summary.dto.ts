import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { MealType } from 'src/database/typeorm/entities/meal-plan/enums/meal-type.enum';
import { DailySummary, MealTypeSummary } from '../models/daily-summary.model';
import { MealLogResponseDto } from './meal-log.dto';
import { ExerciseLogResponseDto } from './exercise-log.dto';

export class GetDailySummaryQueryDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  date: Date;
}

export class GetHistoryQueryDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}

export class MealTypeSummaryDto {
  @ApiProperty({ enum: MealType })
  mealType: MealType;

  @ApiProperty()
  totalCalories: number;

  @ApiProperty()
  totalProtein: number;

  @ApiProperty()
  totalCarbs: number;

  @ApiProperty()
  totalFat: number;

  @ApiProperty({ type: [MealLogResponseDto] })
  logs: MealLogResponseDto[];

  constructor(summary: MealTypeSummary) {
    this.mealType = summary.mealType;
    this.totalCalories = summary.totalCalories;
    this.totalProtein = summary.totalProtein;
    this.totalCarbs = summary.totalCarbs;
    this.totalFat = summary.totalFat;
    this.logs = summary.logs.map((log) => new MealLogResponseDto(log));
  }
}

export class MacrosDistributionDto {
  @ApiProperty({ description: 'Protein percentage' })
  protein: number;

  @ApiProperty({ description: 'Carbs percentage' })
  carbs: number;

  @ApiProperty({ description: 'Fat percentage' })
  fat: number;
}

export class DailySummaryResponseDto {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  totalCaloriesConsumed: number;

  @ApiProperty()
  totalCaloriesBurned: number;

  @ApiProperty()
  netCalories: number;

  @ApiPropertyOptional({ nullable: true })
  remainingCalories: number | null;

  @ApiPropertyOptional({ nullable: true })
  progressPercentage: number | null;

  @ApiPropertyOptional({ nullable: true })
  calorieTarget: number | null;

  @ApiProperty()
  totalProtein: number;

  @ApiProperty()
  totalCarbs: number;

  @ApiProperty()
  totalFat: number;

  @ApiProperty()
  totalFiber: number;

  @ApiProperty()
  totalSugar: number;

  @ApiProperty()
  totalSodium: number;

  @ApiProperty({ type: MacrosDistributionDto })
  macrosDistribution: MacrosDistributionDto;

  @ApiProperty({ type: [MealTypeSummaryDto] })
  mealsByType: MealTypeSummaryDto[];

  @ApiProperty({ type: [ExerciseLogResponseDto] })
  exerciseLogs: ExerciseLogResponseDto[];

  constructor(summary: DailySummary) {
    this.date = summary.date;
    this.totalCaloriesConsumed = summary.totalCaloriesConsumed;
    this.totalCaloriesBurned = summary.totalCaloriesBurned;
    this.netCalories = summary.netCalories;
    this.remainingCalories = summary.remainingCalories;
    this.progressPercentage = summary.progressPercentage;
    this.calorieTarget = summary.calorieTarget;
    this.totalProtein = summary.totalProtein;
    this.totalCarbs = summary.totalCarbs;
    this.totalFat = summary.totalFat;
    this.totalFiber = summary.totalFiber;
    this.totalSugar = summary.totalSugar;
    this.totalSodium = summary.totalSodium;
    this.macrosDistribution = summary.getMacrosDistribution();
    this.mealsByType = summary.getMealsByType().map((s) => new MealTypeSummaryDto(s));
    this.exerciseLogs = summary.exerciseLogs.map((log) => new ExerciseLogResponseDto(log));
  }
}

export class HistoryDayDto {
  @ApiProperty()
  date: Date;

  @ApiProperty()
  totalCaloriesConsumed: number;

  @ApiProperty()
  totalCaloriesBurned: number;

  @ApiProperty()
  netCalories: number;

  @ApiPropertyOptional({ nullable: true })
  calorieTarget: number | null;
}

export class HistoryResponseDto {
  @ApiProperty({ type: [HistoryDayDto] })
  days: HistoryDayDto[];

  @ApiProperty()
  startDate: Date;

  @ApiProperty()
  endDate: Date;
}
