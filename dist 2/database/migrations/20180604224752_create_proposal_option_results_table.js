"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = (db) => {
    return Promise.all([
        db.schema.createTable('proposal_option_results', (table) => {
            table.increments('id').primary();
            table.integer('proposal_result_id').unsigned().notNullable();
            table.foreign('proposal_result_id').references('id')
                .inTable('proposal_results').onDelete('cascade');
            table.integer('proposal_option_id').unsigned().notNullable();
            table.foreign('proposal_option_id').references('id')
                .inTable('proposal_options');
            // todo: should be decimal later, but that didnt work
            table.integer('weight').notNullable();
            table.integer('voters').notNullable();
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};
exports.down = (db) => {
    return Promise.all([
        db.schema.dropTable('proposal_option_results')
    ]);
};
//# sourceMappingURL=20180604224752_create_proposal_option_results_table.js.map