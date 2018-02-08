import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('price_ticker', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('crypto_id').notNullable();
            table.string('crypto_name').notNullable();
            table.string('crypto_symbol').notNullable();

            table.float('crypto_price_usd').notNullable();
            table.float('crypto_price_btc').notNullable();
            table.float('crypto_price_currency').notNullable();

            table.string('convert_currency').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('price_ticker')
    ]);
};
