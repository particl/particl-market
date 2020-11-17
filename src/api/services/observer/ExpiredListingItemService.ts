// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../model/ListingItemService';
import { BaseObserverService } from './BaseObserverService';
import { ObserverStatus } from '../../enums/ObserverStatus';

export class ExpiredListingItemService extends BaseObserverService {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService
    ) {
        super(__filename, process.env.LISTING_ITEMS_EXPIRED_INTERVAL * 60 * 1000, Logger);
    }

    /**
     * Find expired ListingItems and remove them...
     *
     * @param currentStatus
     */
    public async run(currentStatus: ObserverStatus): Promise<ObserverStatus> {

        const listingItems: resources.ListingItem[] = await this.listingItemService.findAllExpired().then(value => value.toJSON());
        for (const listingItem of listingItems) {
            await this.listingItemService.destroy(listingItem.id)
                .catch(reason => {
                    this.log.error('Failed to remove expired ListingItem (' + listingItem.hash + ') on Market (' + listingItem.market + '): ', reason);
                });
        }

        return ObserverStatus.RUNNING;
    }

}
