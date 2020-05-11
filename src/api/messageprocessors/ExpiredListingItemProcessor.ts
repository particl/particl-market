// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ListingItemService } from '../services/model/ListingItemService';

// TODO: this should be refactored, this is not a MessageProcessor!

export class ExpiredListingItemProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    private timeout: any;
    private interval = process.env.LISTING_ITEMS_EXPIRED_INTERVAL * 60 * 1000; // interval to delete expired listing items in milliseconds (passed by minutes)

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService
    ) {
        this.log = new Logger(__filename);
    }


    public async process(): Promise<void> {
        return await this.listingItemService.deleteExpiredListingItems();
    }

    public scheduleProcess(): void {
        this.timeout = setTimeout(
            async () => {
                await this.process();
                this.scheduleProcess();
            },
            this.interval
        );
    }
}
