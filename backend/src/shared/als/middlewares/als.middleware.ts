import { Injectable, NestMiddleware } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { Request, Response, NextFunction } from 'express';
import { v7 as uuidv7 } from 'uuid';
import { ITypeORMAlsStore } from '../interfaces/als-store.interface';

/**
 * Middleware to set up AsyncLocalStorage for each incoming request.
 * @Inject: The AsyncLocalStorage instance is injected to manage request-scoped data.
 */
@Injectable()
export class AlsMiddleware implements NestMiddleware {
  constructor(private readonly als: AsyncLocalStorage<ITypeORMAlsStore>) {}

  //use: called each time a request is made -> new store is created and applied again for each request
  //ITypeORMAlsStore : interface defining the shape of the store
  use(req: Request, res: Response, next: NextFunction) {
    const store: ITypeORMAlsStore = {
      requestId: uuidv7(),
      ctx: null,
    };

    this.als.run(store, () => next());
  }
}
