// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Knex from 'knex';

exports.up = (db: Knex): Promise<any> => {
    return Promise.all([

        // rename some settings keys
        db.schema.raw('UPDATE settings SET key="APP_DEFAULT_PROFILE_ID" where key="DEFAULT_PROFILE_ID"'),
        db.schema.raw('UPDATE settings SET key="APP_DEFAULT_MARKETPLACE_NAME" where key="DEFAULT_MARKETPLACE_NAME"'),
        db.schema.raw('UPDATE settings SET key="APP_DEFAULT_MARKETPLACE_PRIVATE_KEY" where key="DEFAULT_MARKETPLACE_PRIVATE_KEY"'),
        db.schema.raw('UPDATE settings SET key="APP_DEFAULT_MARKETPLACE_ADDRESS" where key="DEFAULT_MARKETPLACE_ADDRESS"'),
        db.schema.raw('UPDATE settings SET key="PROFILE_DEFAULT_MARKETPLACE_ID" where key="DEFAULT_MARKETPLACE_ID"')

    ]);
};

exports.down = (db: Knex): Promise<any> => {
    return Promise.all([
    ]);
};
