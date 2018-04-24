import { Logger as LoggerType } from '../../../core/Logger';
import { MarketService } from '../../services/MarketService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Market } from '../../models/Market';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BaseCommand } from '../BaseCommand';
export declare class MarketAddCommand extends BaseCommand implements RpcCommandInterface<Market> {
    Logger: typeof LoggerType;
    private marketService;
    log: LoggerType;
    constructor(Logger: typeof LoggerType, marketService: MarketService);
    /**
     * data.params[]:
     *  [0]: name
     *  [1]: private_key
     *  [2]: address
     *
     * @param data
     * @returns {Promise<Market>}
     */
    execute(data: RpcRequest): Promise<Market>;
    usage(): string;
    help(): string;
    description(): string;
    example(): string;
}
