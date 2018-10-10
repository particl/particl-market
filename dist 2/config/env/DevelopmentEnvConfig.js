"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const EnvConfig_1 = require("./EnvConfig");
class DevelopmentEnvConfig extends EnvConfig_1.EnvConfig {
    constructor(dataDirLocation) {
        super(dataDirLocation || './data', '.env');
    }
}
exports.DevelopmentEnvConfig = DevelopmentEnvConfig;
//# sourceMappingURL=DevelopmentEnvConfig.js.map