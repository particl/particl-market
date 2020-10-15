// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('blacklists', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('type').notNullable();

            table.string('target').notNullable();   // target hash, listing/market/image/whatever...
            table.string('market').nullable();      // optional market to be blacklisted on

            // these are for removing blacklisted listings/markets from search results
            // todo: remove
            table.integer('listing_item_id').unsigned().nullable();
            table.foreign('listing_item_id').references('id')
                .inTable('listing_items').onDelete('CASCADE');

            // todo: remove this too
            table.integer('market_id').unsigned().nullable();
            table.foreign('market_id').references('id')
                .inTable('markets').onDelete('CASCADE');

            // for which profile this blacklist applies to, for example listing could be removed only for specific profile
            table.integer('profile_id').unsigned().nullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('CASCADE');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('blacklists')
    ]);
};
