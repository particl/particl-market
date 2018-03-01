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
        // todo: move default market info to env variables?
        const defaultMarket = {
            name: 'DEFAULT',
            private_key: '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
            address: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA'
        } as MarketCreateRequest;
        await this.insertOrUpdateMarket(defaultMarket);
        return;
    }

    public async insertOrUpdateMarket(market: MarketCreateRequest): Promise<Market> {
        let newMarket = await this.marketService.findByAddress(market.address);
        if (newMarket === null) {
            newMarket = await this.marketService.create(market as MarketCreateRequest);
            this.log.debug('created new default Market: ', newMarket);
        } else {
            newMarket = await this.marketService.update(newMarket.Id, market as MarketUpdateRequest);
            this.log.debug('updated new default Market: ', newMarket);
        }
        await this.coreRpcService.smsgImportPrivKey(newMarket.PrivateKey);
        return newMarket;
    }
}
