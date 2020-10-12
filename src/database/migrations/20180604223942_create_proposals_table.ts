// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('proposals', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('msgid').nullable();   // first created without, later updated
            table.string('market').nullable();  // market hash

            table.string('submitter').notNullable();
            table.string('hash').notNullable().unique();
            table.string('target').nullable();    // proposal target hash
            table.string('category').notNullable();
            table.text('title').nullable();
            table.text('description').nullable();

            table.timestamp('time_start').notNullable();
            table.integer('posted_at').notNullable();
            table.integer('received_at').notNullable();
            table.integer('expired_at').notNullable();

            table.integer('final_result_id').unsigned().nullable(); // set to final result after proposal expires
            table.foreign('final_result_id').references('id')
                .inTable('proposal_results');

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
