import { Module } from '@nestjs/common';
import { MEAL_PLAN_SERVICE } from './tokens/meal-plan.token';
import { MealPlanService } from './meal-plan.service';
import { MealPlanController } from './meal-plan.controller';
import { DatabaseModule } from 'src/database/database.module';
import { AlsModule } from 'src/shared/als/als.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [DatabaseModule, AlsModule, SessionModule],
  providers: [
    {
      provide: MEAL_PLAN_SERVICE,
      useClass: MealPlanService,
    },
  ],
  controllers: [MealPlanController],
  exports: [MEAL_PLAN_SERVICE],
})
export class MealPlanModule {}
