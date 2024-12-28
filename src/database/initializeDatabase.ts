import { Knex } from 'knex';

export const initializeDatabase = async (db: Knex): Promise<void> => {
    try {
        const hasSessionsTable = await db.schema.hasTable('sessions');
        if (!hasSessionsTable) {
            await db.schema.createTable('sessions', (table) => {
                table.uuid('session_id').primary();
                table.string('customer_id').notNullable();
                table.timestamp('created_at').defaultTo(db.fn.now());
            });
            console.log('Created table: sessions');
        }

        const hasFilesTable = await db.schema.hasTable('files');
        if (!hasFilesTable) {
            await db.schema.createTable('files', (table) => {
                table.increments('id').primary();
                table.string('file_path').notNullable();
                table.jsonb('encodings').notNullable();
                table.uuid('session_id').references('session_id').inTable('sessions').onDelete('CASCADE');
                table.timestamp('created_at').defaultTo(db.fn.now());
            });
            console.log('Created table: files');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
};