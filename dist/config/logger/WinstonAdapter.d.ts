export declare class WinstonAdapter implements interfaces.LoggerAdapter {
    private scope;
    private logger;
    constructor(scope: string);
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    private parseArgs(args);
    private formatScope();
}
