import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('item_prices', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('currency').notNullable();
            table.integer('base_price').notNullable();

            table.integer('payment_information_id').unsigned();
            table.foreign('payment_information_id').references('id')
                .inTable('payment_informations').onDelete('cascade');

            table.integer('cryptocurrency_address_id').unsigned().nullable();
            table.foreign('cryptocurrency_address_id').references('id')
                .inTable('cryptocurrency_addresses');

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
