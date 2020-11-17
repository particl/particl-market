// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';


exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.createTable('notifications', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();

            table.string('msgid').notNullable();
            table.string('type').nullable();
            table.integer('object_id').nullable();
            table.string('object_hash').nullable();
            table.integer('parent_object_id').nullable();
            table.string('parent_object_hash').nullable();
            table.string('target').nullable();
            table.string('from').nullable();
            table.string('to').nullable();
            table.string('market').nullable();
            table.string('category').nullable();
            table.boolean('read').defaultTo(false);

            table.integer('profile_id').unsigned().nullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('cascade');

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('notifications')
    ]);
};
