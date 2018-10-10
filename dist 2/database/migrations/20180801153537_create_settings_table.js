"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('settings', (table) => {
            table.increments('id').primary();
            table.string('key').notNullable();
            table.string('value').notNullable();
            table.integer('profile_id').unsigned().notNullable();
            table.foreign('profile_id').references('id').inTable('profiles').onDelete('CASCADE');
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('settings')
    ]);
};
//# sourceMappingURL=20180801153537_create_settings_table.js.map