"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('locked_outputs', (table) => {
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
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('locked_outputs')
    ]);
};
//# sourceMappingURL=20180404112623_create_locked_outputs_table.js.map