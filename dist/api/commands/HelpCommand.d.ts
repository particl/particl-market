import { Logger as LoggerType } from '../../core/Logger';
import { RpcCommandInterface } from './RpcCommandInterface';
import { RpcCommandFactory } from '../factories/RpcCommandFactory';
import { BaseCommand } from './BaseCommand';
export declare class HelpCommand extends BaseCommand implements RpcCommandInterface<string> {
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    /**
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<string>}
     */
    execute(data: any, rpcCommandFactory: RpcCommandFactory): Promise<string>;
    generateHelp(commands: string[], rpcCommandFactory: RpcCommandFactory): string;
    _generateHelp(commands: string[], rpcCommandFactory: RpcCommandFactory, command: any): string;
    usage(): string;
    help(): string;
    example(): string;
    description(): string;
}
