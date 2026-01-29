import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsDate,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExerciseLog } from '../models/exercise-log.model';

export class AddExerciseDto {
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  logDate: Date;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  exerciseName: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationMinutes: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  caloriesBurned: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  exerciseName?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  durationMinutes?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  caloriesBurned?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ExerciseLogResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  logDate: Date;

  @ApiProperty()
  exerciseName: string;

  @ApiProperty()
  durationMinutes: number;

  @ApiProperty()
  caloriesBurned: number;

  @ApiPropertyOptional({ nullable: true })
  notes: string | null;

  @ApiProperty()
  createdAt: Date;

  constructor(log: ExerciseLog) {
    this.id = log.id;
    this.logDate = log.logDate;
    this.exerciseName = log.exerciseName;
    this.durationMinutes = log.durationMinutes;
    this.caloriesBurned = log.caloriesBurned;
    this.notes = log.notes;
    this.createdAt = log.createdAt;
  }
}
