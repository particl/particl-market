// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('listing_item_templates', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('hash').nullable().unique();

            table.integer('profile_id').notNullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('RESTRICT');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('listing_item_templates')
    ]);
};
