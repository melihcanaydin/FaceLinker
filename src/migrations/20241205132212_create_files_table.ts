import { Knex } from 'knex';

export async function up(knex: Knex) {
  const hasTable = await knex.schema.hasTable('files');
  if (!hasTable) {
      return knex.schema.createTable('files', (table) => {
          table.increments('id').primary();
          table.string('file_path').notNullable();
          table.uuid('session_id').references('session_id').inTable('sessions').onDelete('CASCADE');
          table.json('encodings').notNullable();
          table.timestamp('created_at').defaultTo(knex.fn.now());
      });
  }
}

export async function down(knex: Knex) {
  const hasTable = await knex.schema.hasTable('files');
  if (hasTable) {
      return knex.schema.dropTable('files');
  }
}