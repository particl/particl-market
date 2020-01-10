// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';

exports.up = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.table('proposals', (table: Knex.AlterTableBuilder) => {
            table.string('market').nullable();  // market hash
        })
    ]);

};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
    ]);
};
