import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
export declare class ItemLocationRootCommand extends BaseCommand implements RpcCommandInterface<void> {
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    execute(data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any>;
    usage(): string;
    help(): string;
    description(): string;
}
