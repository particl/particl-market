import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('action_messages', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('action').notNullable();
            table.string('nonce').notNullable();
            table.boolean('accepted').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('action_messages')
    ]);
};
