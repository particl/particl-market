// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';

exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.table('smsg_messages', (table: Knex.AlterTableBuilder) => {
            table.integer('processed_count').notNullable().defaultTo(0);
            table.integer('processed_at').notNullable().defaultTo(0);
        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
    ]);
};
