import { inject, named } from 'inversify';
import { validate } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { BidFactory } from '../factories/BidFactory';
import { Bid } from '../models/Bid';
import { BidMessage } from '../messages/BidMessage';
import { BidService } from '../services/BidService';
import { ListingItemService } from '../services/ListingItemService';
import { NotFoundException } from '../exceptions/NotFoundException';

export class BidMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    @validate()
    public async process(message: BidMessage ): Promise<Bid> {
        // find listingItem by hash
        const listingItem = await this.listingItemService.findOneByHash(message.item);
        // if listingItem not found
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${message.item} was not found!`);
            throw new NotFoundException(message.item);
        } else {
            const bid = this.bidFactory.get(message);
            // setting the bid relation with listingItem
            bid['listing_item_id'] = listingItem.id;
            return await this.bidService.create(bid);
        }
    }
}
