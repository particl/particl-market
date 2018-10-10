"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * core.log.WinstonAdapter
 * ------------------------------------------------
 *
 * This adapter uses the winston module to print all logs
 * to the terminal.
 *
 * Remote logging can be added here to this adapter.
 */
const winston = require("winston");
const Environment_1 = require("../../core/helpers/Environment");
const DataDir_1 = require("../../core/helpers/DataDir");
class WinstonAdapter {
    constructor(scope) {
        this.scope = scope;
        const logs = [
            new winston.transports.Console({
                level: process.env.LOG_LEVEL,
                timestamp: true,
                handleExceptions: Environment_1.Environment.isProduction(),
                json: Environment_1.Environment.isProduction(),
                colorize: !Environment_1.Environment.isProduction()
            })
        ];
        if (process.env.LOG_PATH) {
            logs.push(new winston.transports.File({
                level: process.env.LOG_LEVEL,
                filename: DataDir_1.DataDir.getLogFile(),
                handleExceptions: Environment_1.Environment.isProduction(),
                json: Environment_1.Environment.isProduction(),
                maxsize: 52428800,
                maxFiles: 5,
                colorize: false
            }));
        }
        this.logger = new winston.Logger({
            transports: logs,
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