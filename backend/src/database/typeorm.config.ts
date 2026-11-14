import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

export function typeOrmOptions(): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? '127.0.0.1',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'nestjs_react_todo',
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
  };
}
