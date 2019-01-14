// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('shipping_destinations', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('country', 3).notNullable();
            table.string('shipping_availability').notNullable();

            table.integer('item_information_id').unsigned().nullable();
            table.foreign('item_information_id').references('id')
                .inTable('item_informations').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('shipping_destinations')
    ]);
};
