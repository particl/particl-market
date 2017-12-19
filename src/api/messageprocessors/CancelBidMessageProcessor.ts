import { inject, named } from 'inversify';
import { validate } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { BidMessage } from '../messages/BidMessage';
import { Bid } from '../models/Bid';
import { ListingItemService } from '../services/ListingItemService';
import { BidService } from '../services/BidService';
import { BidFactory } from '../factories/BidFactory';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageException } from '../exceptions/MessageException';
import { BidStatus } from '../enums/BidStatus';

export class CancelBidMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * Cancel bid
     * message:
     * item: message.item
     * action: message.action
     *
     * @returns {Promise<Bid>}
     */

    @validate()
    public async process( message: BidMessage ): Promise<Bid> {
        // find listingItem by hash
        const listingItem = await this.listingItemService.findOneByHash(message['item']);

        // if listingItem not found
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${message.item} was not found!`);
            throw new NotFoundException(message.item);
        } else {
            // find related bid
            // TODO: LATER WE WILL CHANGE IT FOR THE SINGLE BID
            const bid = listingItem.related('Bids').toJSON()[0];

            // if bid not found for the given listing item hash
            if (!bid) {
                this.log.warn(`Bid with the listing Item hash=${message['item']} was not found!`);
                throw new MessageException(`Bid not found for the listing item hash ${message['item']}`);

            } else if (bid.status === BidStatus.ACTIVE) {
                // convert the bid message to bid
                const bidMessage = this.bidFactory.get(message);

                // setting the bid relation with listingItem
                bidMessage['listing_item_id'] = bid.listingItemId;

                // update the bid status to cancel only if bid status is active
                return await this.bidService.update(bid.id, bidMessage);
            } else {
                throw new MessageException(`Bid can not be cancelled because it was already been ${bid.status}`);
            }
        }
    }

}
