"use strict";
/**
 * core.log.WinstonAdapter
 * ------------------------------------------------
 *
 * This adapter uses the winston module to print all logs
 * to the terminal.
 *
 * Remote logging can be added here to this adapter.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const Environment_1 = require("../../core/helpers/Environment");
class WinstonAdapter {
    constructor(scope) {
        this.scope = scope;
        this.logger = new winston.Logger({
            transports: [
                new winston.transports.Console({
                    level: process.env.LOG_LEVEL,
                    timestamp: true,
                    handleExceptions: Environment_1.Environment.isProduction(),
                    json: Environment_1.Environment.isProduction(),
                    colorize: !Environment_1.Environment.isProduction()
                })
            ],
            exitOnError: false
        });
    }
    debug(message, ...args) {
        this.logger.debug(`${this.formatScope()} ${message}`, this.parseArgs(args));
    }
    info(message, ...args) {
        this.logger.info(`${this.formatScope()} ${message}`, this.parseArgs(args));
    }
    warn(message, ...args) {
        this.logger.warn(`${this.formatScope()} ${message}`, this.parseArgs(args));
    }
    error(message, ...args) {
        this.logger.error(`${this.formatScope()} ${message}`, this.parseArgs(args));
    }
    parseArgs(args) {
        return (args && args[0] && args[0].length > 0) ? args : '';
    }
    formatScope() {
        return `[${this.scope}]`;
    }
}
exports.WinstonAdapter = WinstonAdapter;
//# sourceMappingURL=WinstonAdapter.js.map