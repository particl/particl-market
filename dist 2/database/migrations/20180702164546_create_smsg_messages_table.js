"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('smsg_messages', (table) => {
            table.increments('id').primary();
            table.string('type').notNullable();
            table.string('status').notNullable();
            table.string('msgid').notNullable().unique();
            table.string('version').notNullable();
            table.boolean('read').nullable();
            table.boolean('paid').nullable();
            table.integer('payloadsize').nullable();
            table.integer('received').notNullable();
            table.integer('sent').notNullable();
            table.integer('expiration').notNullable();
            table.integer('daysretention').notNullable();
            table.string('from').notNullable();
            table.string('to').notNullable();
            table.text('text').nullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('smsg_messages')
    ]);
};
//# sourceMappingURL=20180702164546_create_smsg_messages_table.js.map