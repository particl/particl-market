// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('shopping_cart', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('name').notNullable();

            table.integer('profile_id').unsigned().notNullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('CASCADE');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('shopping_cart')
    ]);
};
