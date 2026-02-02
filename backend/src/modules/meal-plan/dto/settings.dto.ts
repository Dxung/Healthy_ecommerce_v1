import { IsArray, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HealthProfileResponseDto } from './health-profile.dto';
import { DietPreferenceInfo } from '../repository/diet-preference.repository.interface';
import { AllergenExclusionInfo } from '../repository/allergen-exclusion.repository.interface';

export class UpdateDietPreferencesDto {
  @IsArray()
  @IsUUID('all', { each: true })
  dietTagIds: string[];
}

export class UpdateAllergenExclusionsDto {
  @IsArray()
  @IsUUID('all', { each: true })
  allergenTagIds: string[];
}

export class DietPreferenceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  dietTagId: string;

  @ApiProperty()
  dietTagName: string;

  @ApiProperty()
  dietTagSlug: string;

  constructor(info: DietPreferenceInfo) {
    this.id = info.id;
    this.dietTagId = info.dietTagId;
    this.dietTagName = info.dietTagName;
    this.dietTagSlug = info.dietTagSlug;
  }
}

export class AllergenExclusionDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  allergenTagId: string;

  @ApiProperty()
  allergenTagName: string;

  @ApiProperty()
  allergenTagSlug: string;

  constructor(info: AllergenExclusionInfo) {
    this.id = info.id;
    this.allergenTagId = info.allergenTagId;
    this.allergenTagName = info.allergenTagName;
    this.allergenTagSlug = info.allergenTagSlug;
  }
}

export class MealPlanSettingsResponseDto {
  @ApiProperty({ type: HealthProfileResponseDto })
  healthProfile: HealthProfileResponseDto;

  @ApiProperty({ type: [DietPreferenceDto] })
  dietPreferences: DietPreferenceDto[];

  @ApiProperty({ type: [AllergenExclusionDto] })
  allergenExclusions: AllergenExclusionDto[];

  constructor(
    healthProfile: HealthProfileResponseDto,
    dietPreferences: DietPreferenceInfo[],
    allergenExclusions: AllergenExclusionInfo[],
  ) {
    this.healthProfile = healthProfile;
    this.dietPreferences = dietPreferences.map((p) => new DietPreferenceDto(p));
    this.allergenExclusions = allergenExclusions.map(
      (e) => new AllergenExclusionDto(e),
    );
  }
}
