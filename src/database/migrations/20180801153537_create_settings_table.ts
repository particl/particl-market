// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('settings', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('key').notNullable();
            table.string('value').notNullable();

            table.integer('profile_id').unsigned().nullable();
            table.foreign('profile_id').references('id').inTable('profiles').onDelete('CASCADE');

            table.integer('market_id').unsigned().nullable();
            table.foreign('market_id').references('id').inTable('markets').onDelete('CASCADE');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());

            table.unique(['key', 'profile_id', 'market_id']);

        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('settings')
    ]);
};
