import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('item_prices', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('currency').notNullable();
            table.integer('base_price').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('item_prices')
    ]);
};
