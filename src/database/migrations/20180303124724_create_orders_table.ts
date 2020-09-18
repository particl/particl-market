// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('orders', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('status').notNullable();
            table.integer('generated_at').notNullable();
            table.string('hash').notNullable();
            table.string('buyer').notNullable();
            table.string('seller').notNullable();

            table.integer('address_id').unsigned().notNullable();
            // table.foreign('address_id').references('id')
            //    .inTable('addresses');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('orders')
    ]);
};
