import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('message_escrows', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('type').notNullable();
            table.string('rawtx').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('message_escrows')
    ]);
};
