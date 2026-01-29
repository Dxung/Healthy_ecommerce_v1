import { EntityManager } from 'typeorm';

/**
 * Interface for shaping ALS (Asynchronous Local Storage) store.
 */
export interface ITypeORMAlsStore {
  requestId: string;
  userId?: string;
  sessionId?: string;
  ctx?: EntityManager | null;
}
