"use strict";
/**
 * config.Custom
 * ------------------------------------
 *
 * Define all log adapters for this application and chose one.
 */
Object.defineProperty(exports, "__esModule", { value: true });
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