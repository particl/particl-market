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
export declare const DatabaseConfig: {
    client: any;
    connection: any;
    pool: {
        min: number;
        max: number;
        afterCreate: (conn: any, cb: any) => void;
    };
    migrations: {
        directory: any;
        tableName: any;
    };
    seeds: {
        directory: any;
    };
    useNullAsDefault: boolean;
    debug: boolean;
};
export declare const Knex: () => knex;
export declare const Bookshelf: bookshelf;
