import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Market } from '../models/Market';
import { MarketService } from './MarketService';
import { MarketCreateRequest } from '../requests/MarketCreateRequest';
import { MarketUpdateRequest } from '../requests/MarketUpdateRequest';
import {CoreRpcService} from './CoreRpcService';


export class DefaultMarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    public async seedDefaultMarket(): Promise<void> {

        const MARKETPLACE_NAME          = process.env.DEFAULT_MARKETPLACE_NAME
                                            ? process.env.DEFAULT_MARKETPLACE_NAME
                                            : 'DEFAULT';
        const MARKETPLACE_PRIVATE_KEY   = process.env.DEFAULT_MARKETPLACE_PRIVATE_KEY
                                            ? process.env.DEFAULT_MARKETPLACE_PRIVATE_KEY
                                            : '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek';
        const MARKETPLACE_ADDRESS       = process.env.DEFAULT_MARKETPLACE_ADDRESS
                                            ? process.env.DEFAULT_MARKETPLACE_ADDRESS
                                            : 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA';

        const defaultMarket = {
            name: MARKETPLACE_NAME,
            private_key: MARKETPLACE_PRIVATE_KEY,
            address: MARKETPLACE_ADDRESS
        } as MarketCreateRequest;
        await this.insertOrUpdateMarket(defaultMarket);
        return;
    }

    public async insertOrUpdateMarket(market: MarketCreateRequest): Promise<Market> {
        let newMarketModel = await this.marketService.findByAddress(market.address);
        if (newMarketModel === null) {
            newMarketModel = await this.marketService.create(market as MarketCreateRequest);
            this.log.debug('created new default Market: ', JSON.stringify(newMarketModel, null, 2));
        } else {
            newMarketModel = await this.marketService.update(newMarketModel.Id, market as MarketUpdateRequest);
            this.log.debug('updated new default Market: ', JSON.stringify(newMarketModel, null, 2));
        }
        const newMarket = newMarketModel.toJSON();
        await this.coreRpcService.smsgImportPrivKey(newMarket.privateKey);
        return newMarket;
    }
}
