"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const EnvConfig_1 = require("./EnvConfig");
class AlphaEnvConfig extends EnvConfig_1.EnvConfig {
    constructor() {
        super();
        process.env.SWAGGER_ENABLED = false;
        // process.env.MIGRATE = false;
    }
}
exports.AlphaEnvConfig = AlphaEnvConfig;
//# sourceMappingURL=AlphaEnvConfig.js.map