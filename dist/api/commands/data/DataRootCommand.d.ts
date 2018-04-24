import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { DataAddCommand } from './DataAddCommand';
import { DataCleanCommand } from './DataCleanCommand';
import { DataGenerateCommand } from './DataGenerateCommand';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
export declare class DataRootCommand extends BaseCommand implements RpcCommandInterface<void> {
    private dataAddCommand;
    private dataCleanCommand;
    private dataGenerateCommand;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(dataAddCommand: DataAddCommand, dataCleanCommand: DataCleanCommand, dataGenerateCommand: DataGenerateCommand, Logger: typeof LoggerType);
    execute(data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any>;
    usage(): string;
    help(): string;
    description(): string;
}
