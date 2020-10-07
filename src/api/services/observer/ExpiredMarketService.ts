// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BaseObserverService } from './BaseObserverService';
import { ObserverStatus } from '../../enums/ObserverStatus';
import { MarketService } from '../model/MarketService';


export class ExpiredMarketService extends BaseObserverService {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(__filename, process.env.MARKETS_EXPIRED_INTERVAL * 60 * 1000, Logger);
    }

    /**
     * Find expired Markets and remove them...
     *
     * @param currentStatus
     */
    public async run(currentStatus: ObserverStatus): Promise<ObserverStatus> {

        const markets: resources.Market[] = await this.marketService.findAllExpired().then(value => value.toJSON());
        for (const market of markets) {
            if (market.expiredAt <= Date.now()) {
                await this.marketService.destroy(market.id)
                    .catch(reason => {
                        this.log.error('Failed to remove expired Market (' + market.hash + '): ', reason);
                    });
            }
        }

        return ObserverStatus.RUNNING;
    }

}
