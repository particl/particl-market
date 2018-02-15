import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('currency_prices', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('from').notNullable();
            table.string('to').notNullable();
            table.float('price').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('currency_prices')
    ]);
};
