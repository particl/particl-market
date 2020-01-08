// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';

exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        // rename flagged_items to flagged_items_old
        db.schema.raw('ALTER TABLE flagged_items RENAME TO flagged_items_old')

    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
        db.schema.raw('ALTER TABLE flagged_items_old RENAME TO flagged_items')
    ]);
};
