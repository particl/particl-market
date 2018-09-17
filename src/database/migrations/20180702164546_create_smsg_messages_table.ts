// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('smsg_messages', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('type').notNullable();
            table.string('status').notNullable();
            table.string('msgid').notNullable().unique();
            table.string('version').notNullable();
            table.boolean('read').nullable();
            table.boolean('paid').nullable();
            table.integer('payloadsize').nullable();

            table.integer('received').notNullable();
            table.integer('sent').notNullable();
            table.integer('expiration').notNullable();

            table.integer('daysretention').notNullable();
            table.string('from').notNullable();
            table.string('to').notNullable();
            table.text('text').nullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('smsg_messages')
    ]);
};
