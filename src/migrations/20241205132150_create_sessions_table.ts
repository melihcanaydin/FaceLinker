import { Knex } from 'knex';

export async function up(knex: Knex) {
  const exists = await knex.schema.hasTable('sessions');
  if (!exists) {
    return knex.schema.createTable('sessions', (table) => {
      table.uuid('session_id').primary();
      table.string('customer_id').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
    });
  }
}

export async function down(knex: Knex) {
  return knex.schema.dropTableIfExists('sessions');
}