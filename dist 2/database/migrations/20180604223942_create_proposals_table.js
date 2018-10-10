"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('proposals', (table) => {
            table.increments('id').primary();
            table.string('submitter').notNullable();
            table.integer('block_start').notNullable();
            table.integer('block_end').notNullable();
            table.string('hash').notNullable().unique();
            table.string('item').nullable(); // item hash
            table.string('type').notNullable();
            table.text('title').nullable();
            table.text('description').nullable();
            table.integer('expiry_time').unsigned();
            table.integer('received_at').notNullable();
            table.integer('posted_at').notNullable();
            table.integer('expired_at').notNullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('proposals')
    ]);
};
//# sourceMappingURL=20180604223942_create_proposals_table.js.map