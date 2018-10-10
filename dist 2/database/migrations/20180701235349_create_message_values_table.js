"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('message_values', (table) => {
            table.increments('id').primary();
            table.integer('action_message_id').unsigned();
            table.foreign('action_message_id').references('id')
                .inTable('action_messages').onDelete('cascade');
            table.string('key').notNullable();
            table.string('value').notNullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('message_values')
    ]);
};
//# sourceMappingURL=20180701235349_create_message_values_table.js.map