// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('locked_outputs', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('txid').notNullable();
            table.integer('vout').notNullable();
            table.bigInteger('amount').nullable();
            table.string('data').nullable();

            table.string('address').nullable();
            table.string('script_pub_key').nullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());

            table.integer('bid_id').unsigned().nullable();
            table.foreign('bid_id').references('id').inTable('bids');
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('locked_outputs')
    ]);
};
