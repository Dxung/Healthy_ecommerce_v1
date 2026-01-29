import { Injectable } from '@nestjs/common';
import { DataSource, LessThan } from 'typeorm';
import { ResultAsync } from 'neverthrow';
import { AsyncLocalStorage } from 'async_hooks';
import { IPaymentTransactionRepository } from 'src/modules/payment/repository/payment-transaction.repository.interface';
import { PaymentTransaction } from 'src/modules/payment/models/payment-transaction.model';
import { ORMPaymentTransaction } from '../../entities/payment/orm.payment-transaction.entity';
import { ORMPaymentTransactionMapper } from '../../mappers/payment-transaction.mapper.orm';
import { PaymentStatus } from '../../entities/payment/enums/payment-status.enum';
import { WithPosition } from 'src/common/decorators/with-position.decorator';
import {
  createDomainError,
  type DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';

@Injectable()
export class OrmPaymentTransactionRepository
  implements IPaymentTransactionRepository
{
  constructor(
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
    private readonly dataSource: DataSource,
  ) {}

  @WithPosition()
  create(
    transaction: PaymentTransaction,
  ): ResultAsync<PaymentTransaction, DomainError> {
    const repo = this.getRepository();
    const ormTransaction = ORMPaymentTransactionMapper.toOrm(transaction);

    return ResultAsync.fromPromise(repo.save(ormTransaction), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMPaymentTransactionMapper.toDomain(saved));
  }

  @WithPosition()
  findById(id: string): ResultAsync<PaymentTransaction | null, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(repo.findOne({ where: { id } }), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormTransaction) =>
      ormTransaction
        ? ORMPaymentTransactionMapper.toDomain(ormTransaction)
        : null,
    );
  }

  @WithPosition()
  findByTxnRef(
    txnRef: string,
  ): ResultAsync<PaymentTransaction | null, DomainError> {
    const repo = this.getRepository();

    return ResultAsync.fromPromise(
      repo.findOne({ where: { vnpayTxnRef: txnRef } }),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((ormTransaction) =>
      ormTransaction
        ? ORMPaymentTransactionMapper.toDomain(ormTransaction)
        : null,
    );
  }

  @WithPosition()
  update(
    transaction: PaymentTransaction,
  ): ResultAsync<PaymentTransaction, DomainError> {
    const repo = this.getRepository();
    const ormTransaction = ORMPaymentTransactionMapper.toOrm(transaction);

    return ResultAsync.fromPromise(repo.save(ormTransaction), (error) =>
      createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((saved) => ORMPaymentTransactionMapper.toDomain(saved));
  }

  @WithPosition()
  save(
    transaction: PaymentTransaction,
  ): ResultAsync<PaymentTransaction, DomainError> {
    return this.update(transaction);
  }

  @WithPosition()
  cancelExpiredPayments(
    expiredMinutes: number,
  ): ResultAsync<number, DomainError> {
    const repo = this.getRepository();
    const expiryTime = new Date(Date.now() - expiredMinutes * 60 * 1000);

    return ResultAsync.fromPromise(
      repo.update(
        {
          status: PaymentStatus.PENDING,
          createdAt: LessThan(expiryTime),
        },
        {
          status: PaymentStatus.CANCELLED,
          updatedAt: new Date(),
        },
      ),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    ).map((result) => result.affected ?? 0);
  }

  private getEntityManager() {
    const store = this.als.getStore();
    if (!store || !store.ctx) return null;
    return store.ctx;
  }

  private getRepository() {
    const em = this.getEntityManager() ?? this.dataSource.manager;
    return em.getRepository(ORMPaymentTransaction);
  }
}
