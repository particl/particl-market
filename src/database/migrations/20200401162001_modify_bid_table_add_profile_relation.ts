// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';

exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.table('bids', (table: Knex.AlterTableBuilder) => {

            table.integer('profile_id').unsigned().nullable()/*.notNullable()*/;
            table.foreign('profile_id').references('id')
                .inTable('profiles').onDelete('cascade');

        })
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
    ]);
};
