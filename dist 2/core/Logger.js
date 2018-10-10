"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
/**
 * core.log.Log
 * ------------------------------------------------
 *
 * This is the main Logger Object. You can create a scope logger
 * or directly use the static log methods.
 *
 * By Default it uses the debug-adapter, but you are able to change
 * this in the start up process in the core/index.ts file.
 */
class Logger {
    constructor(scope) {
        this.scope = Logger.parsePathToScope((scope) ? scope : Logger.DEFAULT_SCOPE);
    }
    static addAdapter(key, adapter) {
        Logger.Adapters.set(key, adapter);
    }
    static setAdapter(key) {
        const adapter = Logger.Adapters.get(key);
        if (adapter !== undefined) {
            Logger.Adapter = adapter;
        }
        else {
            console.log(`No log adapter with key ${key} was found!`);
        }
    }
    // tslint:disable:no-ignored-return
    // tslint:disable:no-misleading-array-reverse
    static parsePathToScope(filepath) {
        if (filepath.indexOf(path.sep) >= 0) {
            // split and reverse filepath
            const split = filepath.split(path.sep).reverse();
            const rebuild = [];
            // rebuild from filename, to dirs.
            split.some((e) => {
                // abort if we reach the src or dist directory
                const quit = (['src', 'dist'].indexOf(e) !== -1);
                if (!quit) {
                    rebuild.push(e);
                }
                return quit;
            });
            filepath = rebuild.reverse().join(path.sep);
            filepath = filepath.replace('.ts', '');
            filepath = filepath.replace('.js', '');
        }
        return filepath;
    }
    getAdapter() {
        return this.adapter;
    }
    debug(message, ...args) {
        this.log('debug', message, args);
    }
    info(message, ...args) {
        this.log('info', message, args);
    }
    warn(message, ...args) {
        this.log('warn', message, args);
    }
    error(message, ...args) {
        this.log('error', message, args);
    }
    log(level, message, args) {
        this.lazyLoadAdapter();
        if (this.adapter) {
            this.adapter[level](message, args);
        }
    }
    lazyLoadAdapter() {
        if (!this.adapter) {
            if (Logger.Adapter) {
                this.adapter = new Logger.Adapter(this.scope);
            }
            else {
                console.log('Please add a log adapter in the LoggerConfig!');
            }
        }
    }
}
Logger.DEFAULT_SCOPE = 'app';
Logger.Adapters = new Map();
exports.Logger = Logger;
//# sourceMappingURL=Logger.js.map