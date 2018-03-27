import { inject, named } from 'inversify';
import {message, validate} from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { MessageProcessorInterface } from '../MessageProcessorInterface';
import { BidFactory } from '../../factories/BidFactory';
import { Bid } from '../../models/Bid';
import { BidMessage } from '../../messages/BidMessage';
import { BidService } from '../../services/BidService';
import { ListingItemService } from '../../services/ListingItemService';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { EventEmitter } from '../../../core/api/events';

export class BidMessageProcessor implements MessageProcessorInterface {

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
     * Process BidMessage of type MPA-BID
     *
     * message:
     *  action: action of the BidMessage
     *  listing: item hash
     *
     * @returns {Promise<Bid>}
     */
    @validate()
    public async process(@message(BidMessage) data: BidMessage): Promise<Bid> {

        // find listingItem by hash, the service will throw Exception if not
        const listingItemModel = await this.listingItemService.findOneByHash(data.item);
        const listingItem = listingItemModel.toJSON();

        this.log.debug('process, listingItem: ', listingItem);

        // get the BidCreateRequest and create the bid
        const bidCreateRequest = await this.bidFactory.getModel(data, listingItem.id);
        this.log.debug('process, bidCreateRequest: ', bidCreateRequest);

        this.eventEmitter.emit('cli', {
            message: 'bid message received ' + JSON.stringify(bidCreateRequest)
        });

        return await this.bidService.create(bidCreateRequest);
    }
}
