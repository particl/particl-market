// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('flagged_items', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('listing_item_id').unsigned().notNullable().unique();
            table.foreign('listing_item_id').references('id')
                .inTable('listing_items').onDelete('cascade');

            table.integer('proposal_id').unsigned().nullable();
            table.foreign('proposal_id').references('id')
                .inTable('proposals');

            table.string('reason').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('flagged_items')
    ]);
};
