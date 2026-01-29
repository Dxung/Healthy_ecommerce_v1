import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as entities from '../typeorm/entities';

export const getTypeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => {
  const nodeEnv = configService.get('NODE_ENV');
  const isProduction = nodeEnv === 'production';

  // Debug log - remove after checking
  console.log('[TypeORM Config] NODE_ENV:', nodeEnv);
  console.log('[TypeORM Config] isProduction:', isProduction);
  console.log('[TypeORM Config] logging:', !isProduction);

  return {
    type: 'postgres',
    host: configService.get('DB_HOST', 'localhost'),
    port: configService.get('DB_PORT', 5432),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_DATABASE'),
    entities: Object.values(entities),
    synchronize: false,
    logging: !isProduction,
    ssl: isProduction ? { rejectUnauthorized: false } : false,

    extra: {
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    },
  };
};
