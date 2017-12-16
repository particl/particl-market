import { inject, named } from 'inversify';
import { validate } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import { MessageProcessorInterface } from './MessageProcessorInterface';
import { BidMessage } from '../messages/BidMessage';
import { Bid } from '../models/Bid';
import { ListingItemService } from '../services/ListingItemService';
import { BidService } from '../services/BidService';
import { AcceptBidFactory } from '../factories/AcceptBidFactory';
import { NotFoundException } from '../exceptions/NotFoundException';
import { MessageException } from '../exceptions/MessageException';
import { BidStatus } from '../enums/BidStatus';

export class AcceptBidMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.AcceptBidFactory) private acceptBidFactory: AcceptBidFactory,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * Accept bid
     * message:
     * action: message.action
     * item: message.item
     *
     * @returns {Promise<Bid>}
     */

    @validate()
    public async process( message: BidMessage ): Promise<Bid> {
        // convert the bid message to bid
        const bidMessage = this.acceptBidFactory.get(message);

        // find listingItem by hash
        const listingItem = await this.listingItemService.findOneByHash(bidMessage['hash']);

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
                this.log.warn(`Bid with the listing Item hash=${bidMessage['hash']} was not found!`);
                throw new MessageException(`Bid not found for the listing item hash ${bidMessage['hash']}`);

            } else if (bid.status === BidStatus.ACTIVE) {
                // update the bid status to accept only if bid status is active
                return await this.bidService.update(bid.id, {listing_item_id: bid.listingItemId, status: BidStatus.ACCEPTED});
            } else {
                throw new MessageException(`Bid can not be accepted because it was already been ${bid.status}`);
            }
        }
    }

}
