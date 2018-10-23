// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('votes', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.integer('proposal_option_id').unsigned().notNullable();
            table.foreign('proposal_option_id').references('id')
                .inTable('proposal_options').onDelete('cascade');

            table.string('voter').notNullable();
            table.integer('weight').notNullable();

            table.timestamp('posted_at').defaultTo(db.fn.now());
            table.timestamp('received_at').defaultTo(db.fn.now());
            table.timestamp('expired_at').defaultTo(db.fn.now());
            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('votes')
    ]);
};
