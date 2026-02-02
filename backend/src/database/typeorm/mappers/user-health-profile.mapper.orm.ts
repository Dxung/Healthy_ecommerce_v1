import { ORMUserHealthProfile } from '../entities/meal-plan';
import { UserHealthProfile } from 'src/modules/meal-plan/models/user-health-profile.model';

export class ORMUserHealthProfileMapper {
  static toDomain(orm: ORMUserHealthProfile): UserHealthProfile {
    // Ensure birthDate is a proper Date object (PostgreSQL date type may return string)
    let birthDate: Date | null = null;
    if (orm.birthDate) {
      birthDate =
        orm.birthDate instanceof Date ? orm.birthDate : new Date(orm.birthDate);
    }

    // Ensure lastLogDate is a proper Date object
    let lastLogDate: Date | null = null;
    if (orm.lastLogDate) {
      lastLogDate =
        orm.lastLogDate instanceof Date
          ? orm.lastLogDate
          : new Date(orm.lastLogDate);
    }

    return new UserHealthProfile(
      orm.id,
      orm.userId,
      orm.weightKg ? parseFloat(orm.weightKg) : null,
      orm.heightCm ? parseFloat(orm.heightCm) : null,
      birthDate,
      orm.gender,
      orm.activityLevel,
      orm.goalType,
      orm.calorieTarget,
      orm.isCalorieTargetManual,
      orm.currentStreak,
      orm.longestStreak,
      lastLogDate,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(domain: UserHealthProfile): ORMUserHealthProfile {
    const orm = new ORMUserHealthProfile();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.weightKg = domain.weightKg?.toString() ?? null;
    orm.heightCm = domain.heightCm?.toString() ?? null;
    orm.birthDate = domain.birthDate;
    orm.gender = domain.gender;
    orm.activityLevel = domain.activityLevel;
    orm.goalType = domain.goalType;
    orm.calorieTarget = domain.calorieTarget;
    orm.isCalorieTargetManual = domain.isCalorieTargetManual;
    orm.currentStreak = domain.currentStreak;
    orm.longestStreak = domain.longestStreak;
    orm.lastLogDate = domain.lastLogDate;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
