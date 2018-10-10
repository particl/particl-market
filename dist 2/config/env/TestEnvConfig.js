"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const EnvConfig_1 = require("./EnvConfig");
class TestEnvConfig extends EnvConfig_1.EnvConfig {
    constructor(dataDirLocation, envFileName) {
        super(dataDirLocation || './', envFileName || '.env.test');
        process.env.EXPRESS_ENABLED = false;
        process.env.SOCKETIO_ENABLED = false;
    }
}
exports.TestEnvConfig = TestEnvConfig;
//# sourceMappingURL=TestEnvConfig.js.map