// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('markets', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();
            table.string('name').notNullable().unique();
            table.string('type').notNullable();
            table.string('receive_key').notNullable();
            table.string('receive_address').notNullable();
            table.string('publish_key').nullable();
            table.string('publish_address').nullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());

            table.integer('profile_id').unsigned().notNullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('cascade');

        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('markets')
    ]);
};
