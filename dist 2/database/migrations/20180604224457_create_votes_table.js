"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('votes', (table) => {
            table.increments('id').primary();
            table.integer('proposal_option_id').unsigned().notNullable();
            table.foreign('proposal_option_id').references('id')
                .inTable('proposal_options').onDelete('cascade');
            table.string('voter').notNullable();
            table.integer('block').notNullable();
            table.integer('weight').notNullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('votes')
    ]);
};
//# sourceMappingURL=20180604224457_create_votes_table.js.map