import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Logger as LoggerType } from '../../../core/Logger';
import { BaseCommand } from '../BaseCommand';
import { RpcCommandFactory } from '../../factories/RpcCommandFactory';
import { CoreRpcService } from '../../services/CoreRpcService';
export declare class DaemonRootCommand extends BaseCommand implements RpcCommandInterface<any> {
    Logger: typeof LoggerType;
    coreRpcService: CoreRpcService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, coreRpcService: CoreRpcService);
    /**
     * data.params[]:
     *  [0]: address id
     *
     * @param data
     * @param rpcCommandFactory
     * @returns {Promise<void>}
     */
    execute(data: RpcRequest, rpcCommandFactory: RpcCommandFactory): Promise<any>;
    usage(): string;
    help(): string;
    description(): string;
}
