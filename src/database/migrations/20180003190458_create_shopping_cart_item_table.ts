import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('shopping_cart_item', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();
            table.integer('shopping_cart_id').unsigned().notNullable();
            table.foreign('shopping_cart_id').references('id')
                .inTable('shopping_cart').onDelete('cascade');

            table.integer('listing_item_id').unsigned().notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('shopping_cart_item')
    ]);
};
