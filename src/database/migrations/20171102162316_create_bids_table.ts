import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('bids', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();
            table.string('action').notNullable();
            table.string('bidder').notNullable();

            table.integer('listing_item_id').unsigned().notNullable();
            table.foreign('listing_item_id').references('id')
                .inTable('listing_items').onDelete('cascade');

            table.integer('address_id').unsigned().notNullable();
            table.foreign('address_id').references('id')
                .inTable('addresses');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('bids')
    ]);
};
