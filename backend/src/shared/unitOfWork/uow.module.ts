import { Module } from '@nestjs/common';
import { UOW_TOKEN } from './tokens/uow.token';
import { TransactionUnitOfWorkTypeORM } from './transactions/transaction-uow.typeorm';
import { AlsModule } from '../als/als.module';

@Module({
  imports: [AlsModule],
  providers: [
    {
      provide: UOW_TOKEN,
      useClass: TransactionUnitOfWorkTypeORM,
    },
  ],
  exports: [UOW_TOKEN],
})
export class UoWModule {}
