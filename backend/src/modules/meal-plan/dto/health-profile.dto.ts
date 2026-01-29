import {
  IsOptional,
  IsNumber,
  IsDate,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalType } from 'src/database/typeorm/entities/meal-plan/enums/goal-type.enum';
import { ActivityLevel } from 'src/database/typeorm/entities/meal-plan/enums/activity-level.enum';
import { Gender } from 'src/database/typeorm/entities/meal-plan/enums/gender.enum';
import { UserHealthProfile } from '../models/user-health-profile.model';

export class UpdateHealthProfileDto {
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  @Type(() => Number)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(50)
  @Max(300)
  @Type(() => Number)
  heightCm?: number;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthDate?: Date;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(ActivityLevel)
  activityLevel?: ActivityLevel;

  @IsOptional()
  @IsEnum(GoalType)
  goalType?: GoalType;

  @IsOptional()
  @IsNumber()
  @Min(500)
  @Max(10000)
  @Type(() => Number)
  calorieTarget?: number;

  @IsOptional()
  @IsBoolean()
  isCalorieTargetManual?: boolean;
}

export class HealthProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiPropertyOptional({ nullable: true })
  weightKg: number | null;

  @ApiPropertyOptional({ nullable: true })
  heightCm: number | null;

  @ApiPropertyOptional({ nullable: true })
  birthDate: Date | null;

  @ApiPropertyOptional({ nullable: true, enum: Gender })
  gender: Gender | null;

  @ApiProperty({ enum: ActivityLevel })
  activityLevel: ActivityLevel;

  @ApiProperty({ enum: GoalType })
  goalType: GoalType;

  @ApiPropertyOptional({ nullable: true })
  calorieTarget: number | null;

  @ApiProperty()
  isCalorieTargetManual: boolean;

  @ApiProperty()
  currentStreak: number;

  @ApiProperty()
  longestStreak: number;

  @ApiPropertyOptional({ nullable: true })
  lastLogDate: Date | null;

  @ApiPropertyOptional({ nullable: true, description: 'Calculated TDEE' })
  calculatedTdee: number | null;

  @ApiPropertyOptional({ nullable: true, description: 'Effective calorie target' })
  effectiveCalorieTarget: number | null;

  constructor(profile: UserHealthProfile) {
    this.id = profile.id;
    this.userId = profile.userId;
    this.weightKg = profile.weightKg;
    this.heightCm = profile.heightCm;
    this.birthDate = profile.birthDate;
    this.gender = profile.gender;
    this.activityLevel = profile.activityLevel;
    this.goalType = profile.goalType;
    this.calorieTarget = profile.calorieTarget;
    this.isCalorieTargetManual = profile.isCalorieTargetManual;
    this.currentStreak = profile.currentStreak;
    this.longestStreak = profile.longestStreak;
    this.lastLogDate = profile.lastLogDate;
    this.calculatedTdee = profile.calculateTDEE();
    this.effectiveCalorieTarget = profile.getEffectiveCalorieTarget();
  }
}
