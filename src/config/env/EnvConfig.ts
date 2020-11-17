// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataDir } from '../../core/helpers/DataDir';
import { Environment, EnvironmentType } from '../../core/helpers/Environment';

export class EnvConfig {

    public dataDir: string;
    public envFile = '.env';

    private defaultEnv = {
        NODE_ENV: EnvironmentType.DEVELOPMENT.toString(),
        APP_NAME: 'particl-market',
        APP_HOST: 'http://localhost',
        APP_URL_PREFIX: '/api',
        APP_PORT: 3000,
        RPCHOSTNAME: 'localhost',
        RPCCOOKIEFILE: '.cookie',
        MAINNET_PORT: 51738,
        TESTNET_PORT: 51935,
        REGTEST_PORT: 19792,
        REGTEST: false,
        INIT: true,
        MIGRATE: true,
        JASMINE_TIMEOUT: 100000,
        MARKET_RPC_AUTH_DISABLED: false,
        MARKET_RPC_USER: 'test',
        MARKET_RPC_PASSWORD: 'test',
        EXPRESS_ENABLED: true,
        SOCKETIO_ENABLED: true,
        ZMQ_ENABLED: true,
        LOG_LEVEL: 'debug',
        LOG_PATH:  'market.log', // todo: separate log_path and log_file
        LOG_ADAPTER: 'winston',
        API_INFO_ENABLED: true,
        API_INFO_ROUTE: '/info',
        CLI_ENABLED: true,
        CLI_ROUTE: '/cli',
        MONITOR_ENABLED: true,
        MONITOR_ROUTE: '/status',
        DB_CLIENT: 'sqlite3',
        DB_POOL_MIN: 2,
        DB_POOL_MAX: 10,
        DB_MIGRATION_TABLE: 'version',
        DATA_CHECK_DELAY: 60,
        CHASING_COINS_API: 'https://chasing-coins.com/api/v1/convert',
        CHASING_COINS_API_DELAY: 60,

        // APP_DEFAULT_MARKETPLACE_NAME: 'DEFAULT',
        // APP_DEFAULT_MARKETPLACE_PRIVATE_KEY: '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',

        // https://github.com/tecnovert/particl-core/blob/f66e893f276e68fa8ece0054b443db61bbc9b5e7/src/smsg/smessage.cpp#L95
        PAID_MESSAGE_RETENTION_DAYS: 7,
        FREE_MESSAGE_RETENTION_DAYS: 7,

        LISTING_ITEMS_EXPIRED_INTERVAL: 10,             // minutes
        LISTING_ITEM_REMOVE_PERCENTAGE: 0.1,
        MARKETS_EXPIRED_INTERVAL: 60,                   // minutes
        MARKET_REMOVE_PERCENTAGE: 0.1,
        PROPOSAL_RESULT_RECALCULATION_INTERVAL: 30,     // minutes
        PROPOSALS_EXPIRED_INTERVAL: 65,                 // minutes

        // https://github.com/particl/particl-core/blob/master/src/smsg/smessage.h#L78
        SMSG_MAX_MSG_BYTES_PAID: 512 * 1024,
        SMSG_MAX_AMSG_BYTES: 512,
        SMSG_MAX_MSG_BYTES: 24000,

        MPMESSAGE_DEBUG: false
};

    /**
     * sets the environment configuration.
     *
     * whatever is set in .env/process.env will override the default config
     *
     * @param {string} dataDirLocation
     * @param {string} envFileName
     */
    constructor(dataDirLocation?: string, envFileName?: string) {

        if (envFileName && DataDir.checkIfExists(envFileName)) {
            this.envFile = envFileName;
        } else {
            this.envFile = path.join(dataDirLocation || DataDir.getDefaultDataDirPath(), this.envFile);
        }

        console.log('EnvConfig: envFile:', this.envFile);
        console.log('EnvConfig: dataDir:', this.dataDir);

        // loads the .env file into the 'process.env' variable.
        dotenv.config({ path: this.envFile });

        // set default values if not set by dotenv
        _.forOwn(this.defaultEnv, (value: any, key: string) => {
            if (typeof process.env[key] === 'undefined') {
                console.log('setting missing: process.env.' + key + ' ->', value);
                process.env[key] = value;
            }
        });

        if (!Environment.isTest()) {
            console.log('current env:');
            _.forOwn(process.env, (value: any, key: string) => {
                if (!_.startsWith(key, 'npm_')) {
                    console.log('process.env.' + key + ':', process.env[key]);
                }
            });
        }

        if (dataDirLocation) {
            // console.log('EnvConfig: setting DataDir:', dataDirLocation);
            // DataDir.set(dataDirLocation);
            this.dataDir = dataDirLocation;
        }

    }

}
