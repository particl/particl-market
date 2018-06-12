/**
 * core.log.WinstonAdapter
 * ------------------------------------------------
 *
 * This adapter uses the winston module to print all logs
 * to the terminal.
 *
 * Remote logging can be added here to this adapter.
 */

import * as winston from 'winston';
import { Environment } from '../../core/helpers/Environment';


export class WinstonAdapter implements interfaces.LoggerAdapter {

    private logger: winston.LoggerInstance;

    constructor(private scope: string) {
        const logs: any = [
            new winston.transports.Console({
                level: process.env.LOG_LEVEL,
                timestamp: true,
                handleExceptions: Environment.isProduction(),
                json: Environment.isProduction(),
                colorize: !Environment.isProduction()
            })
        ];

        if (process.env.LOG_PATH) {
            logs.push(
                new winston.transports.File({
                    level: process.env.LOG_LEVEL,
                    filename: process.env.LOG_PATH,
                    handleExceptions: Environment.isProduction(),
                    json: Environment.isProduction(),
                    maxsize: 52428800, // 50MB
                    maxFiles: 5,
                    colorize: false
                }));
        }


        this.logger = new winston.Logger({
            transports: logs,
            exitOnError: false
        });
    }

    public debug(message: string, ...args: any[]): void {
        this.logger.debug(`${this.formatScope()} ${message}`, this.parseArgs(args));
    }

    public info(message: string, ...args: any[]): void {
        this.logger.info(`${this.formatScope()} ${message}`, this.parseArgs(args));
    }

    public warn(message: string, ...args: any[]): void {
        this.logger.warn(`${this.formatScope()} ${message}`, this.parseArgs(args));
    }

    public error(message: string, ...args: any[]): void {
        this.logger.error(`${this.formatScope()} ${message}`, this.parseArgs(args));
    }

    private parseArgs(args: any[]): any {
        return (args && args[0] && args[0].length > 0) ? args : '';
    }

    private formatScope(): string {
        return `[${this.scope}]`;
    }

}
