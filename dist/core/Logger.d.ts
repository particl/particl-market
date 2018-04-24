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
export declare class Logger {
    static DEFAULT_SCOPE: string;
    static addAdapter(key: string, adapter: interfaces.LoggerAdapterConstructor): void;
    static setAdapter(key: string): void;
    private static Adapter;
    private static Adapters;
    private static parsePathToScope(filepath);
    private scope;
    private adapter;
    constructor(scope?: string);
    getAdapter(): interfaces.LoggerAdapter;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    private log(level, message, args);
    private lazyLoadAdapter();
}
