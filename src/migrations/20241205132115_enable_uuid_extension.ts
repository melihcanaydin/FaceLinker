import { Knex } from 'knex';

export async function up(knex: Knex) {
  const client = knex.client.config.client;

  if (client === 'pg') {
    await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  }
}

export async function down(knex: Knex) {
  const client = knex.client.config.client;

  if (client === 'pg') {
    await knex.raw('DROP EXTENSION IF EXISTS "uuid-ossp"');
  }
}