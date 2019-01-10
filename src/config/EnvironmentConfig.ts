// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Environment } from '../core/helpers/Environment';
import { EnvConfig } from './env/EnvConfig';
import { ProductionEnvConfig } from './env/ProductionEnvConfig';
import { DevelopmentEnvConfig } from './env/DevelopmentEnvConfig';
import { TestEnvConfig } from './env/TestEnvConfig';
import { AlphaEnvConfig } from './env/AlphaEnvConfig';

let config;

export const envConfig = (): EnvConfig => {
    if (config) {
        console.log('envConfig allready created...');
        return config;
    }

    if (Environment.isProduction()) {
        config = new ProductionEnvConfig();
    } else if (Environment.isAlpha()) {
        config = new AlphaEnvConfig();
    } else if (Environment.isDevelopment()) {
        config = new DevelopmentEnvConfig();
    } else if (Environment.isTest()) {
        config = new TestEnvConfig(process.env.MP_DATA_FOLDER || './data/tests', process.env.MP_DOTENV_FILE || '.env.test');
    } else if (Environment.isBlackBoxTest()) {
        config = new TestEnvConfig(process.env.MP_DATA_FOLDER || './data', process.env.MP_DOTENV_FILE || '.env.blackbox');
    } else {
        config = new EnvConfig(process.env.MP_DATA_FOLDER || './data', process.env.MP_DOTENV_FILE || '.env');
    }
    return config;
};

