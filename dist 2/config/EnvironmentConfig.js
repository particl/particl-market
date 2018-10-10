"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const Environment_1 = require("../core/helpers/Environment");
const EnvConfig_1 = require("./env/EnvConfig");
const ProductionEnvConfig_1 = require("./env/ProductionEnvConfig");
const DevelopmentEnvConfig_1 = require("./env/DevelopmentEnvConfig");
const TestEnvConfig_1 = require("./env/TestEnvConfig");
const AlphaEnvConfig_1 = require("./env/AlphaEnvConfig");
let config;
exports.envConfig = () => {
    if (config) {
        console.log('envConfig allready created...');
        return config;
    }
    if (Environment_1.Environment.isProduction()) {
        config = new ProductionEnvConfig_1.ProductionEnvConfig();
    }
    else if (Environment_1.Environment.isAlpha()) {
        config = new AlphaEnvConfig_1.AlphaEnvConfig();
    }
    else if (Environment_1.Environment.isDevelopment()) {
        config = new DevelopmentEnvConfig_1.DevelopmentEnvConfig();
    }
    else if (Environment_1.Environment.isTest()) {
        config = new TestEnvConfig_1.TestEnvConfig(process.env.MP_DATA_FOLDER || './data/tests', process.env.MP_DOTENV_FILE || '.env.test');
    }
    else if (Environment_1.Environment.isBlackBoxTest()) {
        config = new TestEnvConfig_1.TestEnvConfig(process.env.MP_DATA_FOLDER || './data', process.env.MP_DOTENV_FILE || '.env.blackbox');
    }
    else {
        config = new EnvConfig_1.EnvConfig(process.env.MP_DATA_FOLDER || './data', process.env.MP_DOTENV_FILE || '.env');
    }
    return config;
};
//# sourceMappingURL=EnvironmentConfig.js.map