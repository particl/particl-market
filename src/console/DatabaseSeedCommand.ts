// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger } from '../core/Logger';

import * as Knex from 'knex';
import { AbstractCommand } from './lib/AbstractCommand';
import { DatabaseConfig } from '../config/Database';

const log = new Logger(__filename);


/**
 * DatabaseSeedCommand
 *
 * @export
 * @class DatabaseResetCommand
 */
export class DatabaseSeedCommand extends AbstractCommand {

    public static command = 'db:seed';
    public static description = 'Seeding database with testdata.';

    public async run(): Promise<void> {
        const db = Knex(DatabaseConfig as Knex.Config);

        // Close connection to the database
        await db.destroy();
        log.info('Done');
    }

}


