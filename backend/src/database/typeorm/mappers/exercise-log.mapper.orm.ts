import { ORMExerciseLog } from '../entities/meal-plan';
import { ExerciseLog } from 'src/modules/meal-plan/models/exercise-log.model';

export class ORMExerciseLogMapper {
  static toDomain(orm: ORMExerciseLog): ExerciseLog {
    return new ExerciseLog(
      orm.id,
      orm.userId,
      orm.logDate,
      orm.exerciseName,
      orm.durationMinutes,
      parseFloat(orm.caloriesBurned),
      orm.notes,
      orm.createdAt,
      orm.updatedAt,
    );
  }

  static toOrm(domain: ExerciseLog): ORMExerciseLog {
    const orm = new ORMExerciseLog();
    orm.id = domain.id;
    orm.userId = domain.userId;
    orm.logDate = domain.logDate;
    orm.exerciseName = domain.exerciseName;
    orm.durationMinutes = domain.durationMinutes;
    orm.caloriesBurned = domain.caloriesBurned.toString();
    orm.notes = domain.notes;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }

  static toDomainList(ormEntities: ORMExerciseLog[]): ExerciseLog[] {
    return ormEntities.map((orm) => this.toDomain(orm));
  }
}
