// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * config.Database
 * ------------------------------------
 *
 * Here we configure our database connection and
 * our ORM 'bookshelf'.
 *
 * Here would be the place to add more bookshelf plugins.
 */

import * as knex from 'knex';
import * as bookshelf from 'bookshelf';
import { DataDir } from '../core/helpers/DataDir';

// export const DatabaseConfig = {

export const DatabaseConfig = (): any => {

    console.log('DatabaseConfig(), process.env.NODE_ENV:', process.env.NODE_ENV);
    console.log('DatabaseConfig(), process.env.DB_CLIENT:', process.env.DB_CLIENT);

    return {
        client: process.env.DB_CLIENT || 'sqlite3',
        connection: {
            filename: process.env.DB_CONNECTION || DataDir.getDatabaseFile(),
            debug: false
        },
        pool: {
            min: parseInt(process.env.DB_POOL_MIN || 0, 10),
            max: parseInt(process.env.DB_POOL_MAX || 1, 10),
            afterCreate: (conn, cb) => {
                conn.run('PRAGMA foreign_keys = ON', cb);
                conn.run('PRAGMA journal_mode = WAL', cb);
                cb(null, conn);
            }
        },
        migrations: {
            directory: process.env.DB_MIGRATION_DIR || DataDir.getDefaultMigrationsPath(),
            tableName: process.env.DB_MIGRATION_TABLE || 'version'
        },
        // not used anymore, potentially we can delete this.
        seeds: {
            directory: process.env.DB_SEEDS_DIR || DataDir.getDefaultSeedsPath()
        },
        useNullAsDefault: true,
        // debug: true
        debug: false
    };
};

export const Knex = (): knex => {

    console.log('Knex(), process.env.DB_CONNECTION:', process.env.DB_CONNECTION);
    console.log('knex(), config:', JSON.stringify(DatabaseConfig(), null, 2));
    return knex(DatabaseConfig());
};

export const Bookshelf: bookshelf = bookshelf(Knex() as any);
Bookshelf.plugin(['bookshelf-camelcase']);
