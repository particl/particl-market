import { Logger as LoggerType } from '../../../core/Logger';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
export declare class AdminCommand extends BaseCommand implements RpcCommandInterface<any> {
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(Logger: typeof LoggerType);
    /**
     * admin root command, passes the execution to the next command, which is the first in data.params
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<any>}
     */
    execute(data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any>;
    usage(): string;
    help(): string;
    description(): string;
}
