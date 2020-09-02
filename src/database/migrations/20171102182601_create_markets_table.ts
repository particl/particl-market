// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';

exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        db.schema.createTable('markets', (table: Knex.CreateTableBuilder) => {
            table.increments('id').primary();
            table.string('msgid').nullable();

            table.string('name').notNullable();
            table.string('description').nullable();
            table.string('type').notNullable();
            table.string('receive_key').notNullable();
            table.string('receive_address').notNullable();
            table.string('publish_key').nullable();
            table.string('publish_address').nullable();
            table.boolean('removed').notNullable().defaultTo(false);

            table.integer('image_id').unsigned().nullable();
            // table.foreign('image_id').references('id').inTable('images');

            table.string('hash').notNullable();

            table.integer('expiry_time').unsigned().nullable();
            table.integer('generated_at').unsigned().nullable();
            table.integer('received_at').unsigned().nullable();
            table.integer('posted_at').unsigned().nullable();
            table.integer('expired_at').unsigned().nullable();

            table.timestamp('updated_at').defaultTo(db.fn.now());
            table.timestamp('created_at').defaultTo(db.fn.now());

            // can be nullable now, when profile_id/identity_id is not set,
            // the market isn't joined, its just been promoted
            table.integer('profile_id').unsigned().nullable();
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('CASCADE');

            table.integer('identity_id').unsigned().nullable();
            table.foreign('identity_id').references('id')
                .inTable('identities').onDelete('CASCADE');

            // table.unique(['receive_address', 'profile_id']);
            table.unique(['name', 'profile_id']);

        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.dropTable('markets')
    ]);
};
