// Copyright (c) 2017-2019, The Particl Market developers
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

            table.string('signature').notNullable();
            table.string('voter').notNullable();
            table.integer('weight').notNullable();

            table.timestamp('posted_at').notNullable();
            table.timestamp('received_at').notNullable();
            table.timestamp('expired_at').notNullable();

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
