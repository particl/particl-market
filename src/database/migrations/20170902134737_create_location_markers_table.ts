// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('location_markers', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('marker_title').nullable();
            table.text('marker_text').nullable();
            table.float('lat').notNullable();
            table.float('lng').notNullable();

            table.integer('item_location_id').unsigned();
            table.foreign('item_location_id').references('id')
                .inTable('item_locations').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('location_markers')
    ]);
};
