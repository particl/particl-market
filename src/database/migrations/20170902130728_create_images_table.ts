// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('images', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('hash').notNullable();

            table.integer('item_information_id').unsigned().nullable();
            table.foreign('item_information_id').references('id')
                .inTable('item_informations').onDelete('cascade');

            table.boolean('featured').defaultTo(false);

            table.string('msgid').nullable();
            table.string('target').nullable();
            table.timestamp('generated_at').nullable();
            table.timestamp('posted_at').nullable();
            table.timestamp('received_at').nullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('images')
    ]);
};
