import type { Knex } from 'knex';
import { config } from './config/config';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'pg',
    connection: {
      host: config.database.host,
      user: config.database.user,
      password: config.database.password,
      database: config.database.database,
      port: config.database.port,
    },
    pool: {
      min: 2,
      max: config.database.maxConnections,
    },
    migrations: {
      directory: './migrations',
    },
  },
};

export default knexConfig;