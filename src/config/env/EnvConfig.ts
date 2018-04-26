import * as _ from 'lodash';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { DataDir } from '../../core/helpers/DataDir';
import { Environment, EnvironmentType } from '../../core/helpers/Environment';

export class EnvConfig {

    public envFile = '.env';

    private defaultEnv = {
        NODE_ENV: EnvironmentType.DEVELOPMENT.toString(),
        MARKETPLACE_VERSION: '0.0.1.0',
        APP_NAME: 'particl-market',
        APP_HOST: 'http://localhost',
        APP_URL_PREFIX: '/api',
        APP_PORT: 3000,
        RPCUSER: 'test',
        RPCPASSWORD: 'test',
        RPCHOSTNAME: 'localhost',
        MAINNET_PORT: 51738,
        TESTNET_PORT: 51935,
        JASMINE_TIMEOUT: 100000,
        DEFAULT_MARKETPLACE_NAME: 'DEFAULT',
        DEFAULT_MARKETPLACE_PRIVATE_KEY: '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
        DEFAULT_MARKETPLACE_ADDRESS: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
        PAID_MESSAGE_RETENTION_DAYS: 4,
        MARKET_RPC_AUTH_DISABLED: false,
        MARKET_RPC_USER: 'test',
        MARKET_RPC_PASSWORD: 'test',
        LOG_LEVEL: 'debug',
        LOG_ADAPTER: 'winston',
        API_INFO_ENABLED: true,
        API_INFO_ROUTE: '/info',
        CLI_ENABLED: true,
        CLI_ROUTE: '/cli',
        SWAGGER_ENABLED: true,
        SWAGGER_ROUTE: '/docs',
        SWAGGER_FILE: '/src/api/swagger.json',
        MONITOR_ENABLED: true,
        MONITOR_ROUTE: '/status',
        DB_CLIENT: 'sqlite3',
        DB_CONNECTION: './data/database/marketplace.db',
        DB_POOL_MIN: 2,
        DB_POOL_MAX: 10,
        DB_MIGRATION_DIR: './src/database/migrations',
        DB_MIGRATION_TABLE: 'version',
        DB_SEEDS_DIR: './src/database/seeds',
        DATA_CHECK_DELAY: 60,
        CHASING_COINS_API: 'https://chasing-coins.com/api/v1/convert',
        CHASING_COINS_API_DELAY: 60
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

        if (dataDirLocation) {
            DataDir.set(dataDirLocation);
        }

        if (envFileName && DataDir.checkIfExists(envFileName)) {
            this.envFile = envFileName;
        } else {
            this.envFile = path.join(DataDir.getDataDirPath(), this.envFile);
        }

        console.log('EnvConfig: env file path:', this.envFile);

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
            _.forOwn(this.defaultEnv, (value: any, key: string) => {
                console.log('process.env.' + key + ':', process.env[key]);
            });
        }

    }

}
