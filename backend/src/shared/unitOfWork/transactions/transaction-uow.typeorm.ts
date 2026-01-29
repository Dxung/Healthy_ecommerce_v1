import { Injectable } from '@nestjs/common';
import { IUow } from '../interfaces/uow.interface';
import { ITypeORMAlsStore } from 'src/shared/als/interfaces/als-store.interface';
import { AsyncLocalStorage } from 'async_hooks';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';
import {
  createDomainError,
  DomainError,
} from 'src/shared/types/domain-error.type';
import { SHARED_ERRORS } from 'src/shared/errors/shared.errors';
import { errAsync, okAsync, ResultAsync } from 'neverthrow';

@Injectable()
export class TransactionUnitOfWorkTypeORM implements IUow {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly als: AsyncLocalStorage<ITypeORMAlsStore>,
  ) {}

  /**
   * Transaction to execute work inside
   * @param work The work to be done inside transaction
   * @returns ResultAsync with work result or DomainError
   * @note THis method will require these things to work properly:
   * 1. An ALS store must be created and set before calling this method
   * 2. The work function must return a ResultAsync (means it does not throw errors)
   */
  executeInTransaction<T>(
    work: () => ResultAsync<T, DomainError>,
  ): ResultAsync<T, DomainError> {
    //1. Get the current ALS store
    const alsStore = this.als.getStore();
    if (!alsStore) {
      return errAsync(
        createDomainError(SHARED_ERRORS.ALS_STORE_NOT_FOUND, {
          cause: SHARED_ERRORS.ALS_STORE_NOT_FOUND.message,
        }),
      );
    }

    //2. Create QueryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    //Dù thành công hay thất bại thì cũng phải release query runner
    //Tuy nhiên, release cũng có thể throw nên phải dùng cả andThen và orElse để bắt lỗi
    return ResultAsync.fromPromise(
      (async () => {
        //đầu tiên tiến hành connect
        //connect có thể throw, nên cho vào ResultAsync.fromPromise để bắt lỗi
        //kết quả có thể là ok hoặc err (Result)
        const connectResult = await ResultAsync.fromPromise(
          queryRunner.connect(),
          (error) =>
            createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
        );
        //Nếu là err -> connect thất bại -> trả về err
        if (connectResult.isErr()) return connectResult;

        //nếu connect thành công -> bắt đầu transaction
        //startTransaction có thể throw, nên cho vào ResultAsync.fromPromise để bắt lỗi
        //kết quả có thể là ok hoặc err (Result)
        const startTransactionResult = await ResultAsync.fromPromise(
          queryRunner.startTransaction(),
          (error) =>
            createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
        );
        //Nếu là err -> startTransaction thất bại
        //tiến hành release rồi trả về err
        //Tuy nhiên release cũng có thể throw nên cho vào andThen hoặc orElse cuối cùng (bên ngoài fromPromise lớn)
        if (startTransactionResult.isErr()) return startTransactionResult;

        //Nếu transaction thành công -> tiến hành inject manager vào als store
        this.addManagerToStore(alsStore, queryRunner.manager);

        //sau khi inject manager vào store xong thì tiến hành work
        //work không throw, mà chỉ trả về Result
        //Kể cả trong trường hợp work có throw thì cũng sẽ bị bắt ở promise lớn bên ngoài
        const workResult = await work();

        //Xóa manager khỏi store luôn vì manager trong store chỉ phục vụ cho work bên trong transaction này
        this.clearManagerFromStore(alsStore);

        //Nếu work Result là err -> work thất bại -> cần rollback và release.
        //rollback có thể throw nên phải cho vào ResultAsync.fromPromise để bắt lỗi
        //release cũng có thể throw nhưng nên cho vào andThen hoặc orElse cuối cùng (bên ngoài fromPromise lớn)
        if (workResult.isErr()) {
          const rollbackResult = await ResultAsync.fromPromise(
            queryRunner.rollbackTransaction(),
            (error) =>
              createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
          );
          //Xét trường hợp rollbackResult là err -> chứng tỏ rollback thất bại (có throw nhưng bị gói lại)
          //trả về err rollbackResult thay vì err workResult
          if (rollbackResult.isErr()) return rollbackResult;
          //nếu rollback thành công thì trả về err workResult
          return workResult;
        }

        //Trong trường hợp workResult là ok -> tiến hành commit
        //commit cũng có thể throw nên cho vào ResultAsync.fromPromise để bắt lỗi
        const commitResult = await ResultAsync.fromPromise(
          queryRunner.commitTransaction(),
          (error) =>
            createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
        );
        //Nếu commitResult là err -> commit thất bại -> tiến hành rollback rồi trả về err commitResult
        //rollback cũng có thể throw nên cho vào ResultAsync.fromPromise để bắt lỗi (2 cái này thường lỗi đều do connection hoặc DB, nên ghi đè lỗi cuối)
        if (commitResult.isErr()) {
          const rollbackResult = await ResultAsync.fromPromise(
            queryRunner.rollbackTransaction(),
            (error) =>
              createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
          );

          //Xét trường hợp rollbackResult là err -> chứng tỏ rollback thất bại (có throw nhưng bị gói lại)
          //trả về err rollbackResult thay vì err commitResult
          if (rollbackResult.isErr()) return rollbackResult;

          //nếu rollback thành công thì trả về err commitResult
          return commitResult;
        }

        //Nếu commitResult thành công -> tất cả transaction đã thành công -> trả về kết quả
        return workResult;
      })(),
      (error) => createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
    )
      .andThen((result) => {
        //unwrap result bên trong promise lớn
        //sau khi unwrap thì chỉ còn 2 trường hợp:
        //1. happy path: tất cả đều thành công (ok only)
        //2. Unhappy path: kết hợp err trước đó và unhappy path gốc (error bị throw lọt ra ngoài promise lớn): err + err(throw)
        if (result.isOk()) {
          return okAsync(result.value);
        }
        return errAsync(result.error);
      })
      .andThrough(() =>
        //Happy path (trước đó tất cả đều thành công)
        //Tiến hành release query runner
        //nếu release throw thì trả về err
        ResultAsync.fromPromise(queryRunner.release(), (error) =>
          createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
        ),
      )
      .orElse((releaseError) => {
        //Trường hợp unhappy path
        //Tiến hành release query runner
        //kết quả sau khi release là okAsync hoặc errAsync
        //Nếu release thành công (okAsync) -> dùng andThen để trả về err ban đầu (chính là releaseError)
        //Nếu release thất bại (errAsync) -> dùng orElse trả về err của release (đè error ban đầu)
        //Lưu ý:
        //1. releaseError là error ban đầu sau khi unwrap ở trên (đại diện cho err path)
        //2. resultError là error của release (nếu có) đại diện cho errAsync sau khi release

        return ResultAsync.fromPromise(queryRunner.release(), (error) =>
          createDomainError(SHARED_ERRORS.DB_ERROR, { cause: error }),
        )
          .andThen(() => errAsync(releaseError))
          .orElse((resultError) => errAsync(resultError));
      });
  }

  /**
   * Clear manager from ALS store
   * @param alsStore The ALS store
   */
  private clearManagerFromStore(alsStore: ITypeORMAlsStore) {
    alsStore.ctx = null;
  }

  /**
   * Add manager to ALS store
   */
  private addManagerToStore(
    alsStore: ITypeORMAlsStore,
    manager: EntityManager,
  ) {
    alsStore.ctx = manager;
  }
}
