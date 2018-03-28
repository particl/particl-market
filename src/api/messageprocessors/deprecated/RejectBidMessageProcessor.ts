import { inject, named } from 'inversify';
import { message, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { MessageProcessorInterface } from '../MessageProcessorInterface';
import { BidMessage } from '../../messages/BidMessage';
import { Bid } from '../../models/Bid';
import { ListingItemService } from '../../services/ListingItemService';
import { BidService } from '../../services/BidService';
import { BidFactory } from '../../factories/BidFactory';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BidCreateRequest } from '../../requests/BidCreateRequest';
import { EventEmitter } from '../../../core/api/events';

export class RejectBidMessageProcessor implements MessageProcessorInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * Process BidMessage of type MPA-REJECT
     *
     * message:
     *  action: action of the BidMessage
     *  item: item hash
     *
     * @returns {Promise<Bid>}
     */
    @validate()
    public async process(@message(BidMessage) data: BidMessage): Promise<Bid> {
        // find listingItem by hash, the service will throw Exception if not
        const listingItemModel = await this.listingItemService.findOneByHash(data.item);
        const listingItem = listingItemModel.toJSON();

        // find latest bid
        const latestBidModel = await this.bidService.getLatestBid(listingItem.id);
        const latestBid = latestBidModel.toJSON();

        this.eventEmitter.emit('cli', {
            message: 'reject bid message received ' + latestBid
        });

        // get the BidCreateRequest and create the bid
        const bidMessage = await this.bidFactory.getModel(data, listingItem.id, latestBid);
        return await this.bidService.create(bidMessage as BidCreateRequest);
    }

}
