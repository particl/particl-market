import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { Market } from '../models/Market';
import { MarketService } from './MarketService';


export class DefaultMarketService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }


    public async seedDefaultMarket(): Promise<void> {
        const defaultMarket = {
            name: 'DEFAULT-MARKET',
            private_key: 'DEFAULT-PRIVATE-KEY',
            address: 'DEFAULT-MARKET-ADDRESS'
        };
        await this.insertOrUpdateMarket(defaultMarket);
        return;
    }

    public async insertOrUpdateMarket(market: any): Promise<Market> {
        let newMarket = await this.marketService.findByAddress('DEFAULT-MARKET-ADDRESS');
        if (newMarket === null) {
            newMarket = await this.marketService.create(market);
            this.log.debug('created new default Market');
        } else {
            newMarket = await this.marketService.update(newMarket.Id, market);
            this.log.debug('updated new default Market');
        }
        return newMarket;
    }
}
