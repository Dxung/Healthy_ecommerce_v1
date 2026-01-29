import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { AlsMiddleware } from './middlewares/als.middleware';

/**
 * Module that provides AsyncLocalStorage for managing asynchronous context.
 * AsyncLocalStorage object is instantiated once and shared across the application.
 */
@Module({
  providers: [
    {
      provide: AsyncLocalStorage,
      useValue: new AsyncLocalStorage(),
    },
  ],
  exports: [AsyncLocalStorage],
})
export class AlsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    console.log('applied middleware');
    consumer.apply(AlsMiddleware).forRoutes('*');
  }
}
