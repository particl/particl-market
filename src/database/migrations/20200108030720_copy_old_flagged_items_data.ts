// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';

exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        // copy the old data
        db.schema.raw(
            'INSERT INTO flagged_items (id, reason, updated_at, created_at, listing_item_id, proposal_id)' +
            'SELECT id, reason, updated_at, created_at, listing_item_id, proposal_id ' +
            'FROM flagged_items_old')
    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
    ]);
};
