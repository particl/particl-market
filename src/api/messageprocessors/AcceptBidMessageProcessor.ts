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
import {BidCreateRequest} from "../requests/BidCreateRequest";

export class AcceptBidMessageProcessor implements MessageProcessorInterface {

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
     * Process BidMessage of type MPA-ACCEPT
     *
     * message:
     *  action: action of the BidMessage
     *  listing: item hash
     *
     * @returns {Promise<Bid>}
     */
    @validate()
    public async process( message: BidMessage ): Promise<Bid> {

        // find listingItem by hash, the service will throw Exception if not
        const listingItem = await this.listingItemService.findOneByHash(message.listing);

        try {
            // find latest bid
            const latestBid = await this.bidService.getLatestBid(listingItem.id);

            // convert the bid message to bid
            const bidMessage = this.bidFactory.getModel(message, listingItem.id, latestBid);

            // create the new bid with status accept only if previous bid not rejected or cancelled
            return await this.bidService.create(bidMessage as BidCreateRequest);

        } catch (error) {
            throw error;
        }

    }
}
