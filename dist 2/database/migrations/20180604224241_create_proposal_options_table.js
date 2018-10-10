"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('proposal_options', (table) => {
            table.increments('id').primary();
            table.integer('proposal_id').unsigned().notNullable();
            table.foreign('proposal_id').references('id')
                .inTable('proposals').onDelete('cascade');
            table.integer('option_id').notNullable();
            table.string('description').notNullable();
            table.string('hash').notNullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('proposal_options')
    ]);
};
//# sourceMappingURL=20180604224241_create_proposal_options_table.js.map