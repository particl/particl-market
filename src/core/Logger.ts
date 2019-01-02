// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as path from 'path';

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

export class Logger {

    public static DEFAULT_SCOPE = 'app';

    public static addAdapter(key: string, adapter: interfaces.LoggerAdapterConstructor): void {
        Logger.Adapters.set(key, adapter);
    }

    public static setAdapter(key: string): void {
        const adapter = Logger.Adapters.get(key);
        if (adapter !== undefined) {
            Logger.Adapter = adapter;
        } else {
            console.log(`No log adapter with key ${key} was found!`);
        }
    }

    private static Adapter: interfaces.LoggerAdapterConstructor;
    private static Adapters: Map<string, interfaces.LoggerAdapterConstructor> = new Map();

    // tslint:disable:no-ignored-return
    // tslint:disable:no-misleading-array-reverse
    private static parsePathToScope(filepath: string): string {
        if (filepath.indexOf(path.sep) >= 0) {
            // split and reverse filepath
            const split = filepath.split(path.sep).reverse();
            const rebuild: string[] = [];
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
    // tslint:enable:no-misleading-array-reverse
    // tslint:enable:no-ignored-return

    private scope: string;
    private adapter: interfaces.LoggerAdapter;

    constructor(scope?: string) {
        this.scope = Logger.parsePathToScope((scope) ? scope : Logger.DEFAULT_SCOPE);
    }

    public getAdapter(): interfaces.LoggerAdapter {
        return this.adapter;
    }

    public debug(message: string, ...args: any[]): void {
        this.log('debug', message, args);
    }

    public info(message: string, ...args: any[]): void {
        this.log('info', message, args);
    }

    public warn(message: string, ...args: any[]): void {
        this.log('warn', message, args);
    }

    public error(message: string, ...args: any[]): void {
        this.log('error', message, args);
    }

    private log(level: string, message: string, args: any[]): void {
        this.lazyLoadAdapter();
        if (this.adapter) {
            this.adapter[level](message, args);
        }
    }

    private lazyLoadAdapter(): void {
        if (!this.adapter) {
            if (Logger.Adapter) {
                this.adapter = new Logger.Adapter(this.scope);
            } else {
                console.log('Please add a log adapter in the LoggerConfig!');
            }
        }
    }

}
