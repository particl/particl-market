"use strict";
/**
 * config.Logger
 * ------------------------------------
 *
 * Define all log adapters for this application and chose one.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Logger_1 = require("../core/Logger");
const WinstonAdapter_1 = require("./logger/WinstonAdapter");
class LoggerConfig {
    configure() {
        Logger_1.Logger.addAdapter('winston', WinstonAdapter_1.WinstonAdapter);
        Logger_1.Logger.setAdapter(process.env.LOG_ADAPTER);
    }
}
exports.LoggerConfig = LoggerConfig;
//# sourceMappingURL=LoggerConfig.js.map