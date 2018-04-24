import { Logger as LoggerType } from '../../core/Logger';
import { Market } from '../models/Market';
import { MarketService } from './MarketService';
import { MarketCreateRequest } from '../requests/MarketCreateRequest';
import { CoreRpcService } from './CoreRpcService';
import { SmsgService } from './SmsgService';
export declare class DefaultMarketService {
    marketService: MarketService;
    coreRpcService: CoreRpcService;
    smsgService: SmsgService;
    Logger: typeof LoggerType;
    log: LoggerType;
    constructor(marketService: MarketService, coreRpcService: CoreRpcService, smsgService: SmsgService, Logger: typeof LoggerType);
    seedDefaultMarket(): Promise<void>;
    insertOrUpdateMarket(market: MarketCreateRequest): Promise<Market>;
    private getPublicKeyForAddress(address);
}
