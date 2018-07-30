import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';

import { EnvConfig } from '../../config/env/EnvConfig';

import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ListingItem } from '../models/ListingItem';
import { ListingItemService } from '../services/ListingItemService';

export class ExpiredListingItemProcessor {

    public log: LoggerType;

    private timeout: any;
    private interval = process.env.LISTING_ITEMS_EXPIRED_INTERVAL * 60 * 1000; // interval to delete expired listing items in milliseconds (passed by minutes)

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService
    ) {
        this.log = new Logger(__filename);
    }
    // tslint:enable:max-line-length


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
