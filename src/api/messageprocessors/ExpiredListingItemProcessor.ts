import { inject, multiInject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';

import { EnvConfig } from '../../config/env/EnvConfig';

import { MessageProcessorInterface } from './MessageProcessorInterface';
import { ListingItem } from '../models/ListingItem';
import { ListingItemService } from '../services/ListingItemService';

export class ExpiredListingItemProcessor {

    public log: LoggerType;
    public deleteInterval: number; // interval to delete expired listing items in milliseconds (passed by minutes)

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService
    ) {
        this.log = new Logger(__filename);
        this.deleteInterval = process.env.LISTING_ITEMS_EXPIRED_INTERVAL * 60 * 1000;
    }
    // tslint:enable:max-line-length


    public async run(): Promise<void> {
        let prevTime = new Date();
        while (true) {
            const curTime = Date.now();
            if (curTime < prevTime.getTime() + this.deleteInterval) {
                continue;
            }
            const listingItems = await this.listingItemService.deleteExpiredListingItems();
            prevTime = new Date();
        }
    }
}
