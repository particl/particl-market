// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('shipping_prices', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('domestic').notNullable();
            table.integer('international').notNullable();

            table.integer('item_price_id').unsigned();
            table.foreign('item_price_id').references('id').inTable('item_prices').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('shipping_prices')
    ]);
};
