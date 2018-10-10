"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * config.Custom
 * ------------------------------------
 *
 * Define all log adapters for this application and chose one.
 */
const Logger_1 = require("../core/Logger");
class CustomConfig {
    constructor() {
        this.log = new Logger_1.Logger(__filename);
    }
    configure(app) {
        this.log.debug('configuring', app.Express.get('port'));
    }
}
exports.CustomConfig = CustomConfig;
//# sourceMappingURL=CustomConfig.js.map