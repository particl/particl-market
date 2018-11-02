// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('proposals', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('submitter').notNullable();
            table.string('hash').notNullable().unique();
            table.string('item').nullable();   // item hash
            table.string('type').notNullable();
            table.text('title').nullable();
            table.text('description').nullable();

            table.timestamp('time_start').defaultTo(db.fn.now());
            table.integer('expiry_time').unsigned();
            table.integer('received_at').notNullable();
            table.integer('posted_at').notNullable();
            table.integer('expired_at').notNullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('proposals')
    ]);
};
