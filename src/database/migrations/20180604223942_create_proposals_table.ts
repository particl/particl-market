// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('proposals', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('submitter').notNullable();
            table.integer('block_start').notNullable();
            table.integer('block_end').notNullable();
            table.string('hash').notNullable();
            table.string('item').notNullable();
            table.string('type').notNullable();
            table.text('title').nullable();
            table.text('description').nullable();

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
