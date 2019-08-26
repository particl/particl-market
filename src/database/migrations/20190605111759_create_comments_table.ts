// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('comments', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('msgid').nullable();   // first created without, later updated

            table.integer('parent_comment_id').unsigned().nullable();
            table.foreign('parent_comment_id').references('id')
                .inTable('comments').onDelete('cascade');

            table.string('hash').notNullable();
            table.string('sender').notNullable();
            table.string('receiver').notNullable();
            table.string('type').notNullable();
            table.string('target').nullable();
            table.text('message').notNullable();

            table.timestamp('posted_at').notNullable();
            table.timestamp('expired_at').notNullable();
            table.timestamp('received_at').notNullable().defaultTo(db.fn.now());

            table.timestamp('updated_at').notNullable().defaultTo(db.fn.now());
            table.timestamp('created_at').notNullable().defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('comments')
    ]);
};
