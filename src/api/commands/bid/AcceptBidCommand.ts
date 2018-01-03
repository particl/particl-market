import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidMessage } from '../../messages/BidMessage';
import { BidFactory } from '../../factories/BidFactory';
import { ListingItemService } from '../../services/ListingItemService';
import { MessageBroadcastService } from '../../services/MessageBroadcastService';
import { BidService } from '../../services/BidService';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MessageException } from '../../exceptions/MessageException';
import { BidMessageType } from '../../enums/BidMessageType';
import { Bid } from '../../models/Bid';

export class AcceptBidCommand implements RpcCommandInterface<Bid> {

    public log: LoggerType;
    public name: string;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.MessageBroadcastService) private messageBroadcastService: MessageBroadcastService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.name = 'acceptbid';
    }

    /**
     * data.params[]:
     * [0]: item, string
     * [0]: action, string
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bid> {
        // find listingItem by hash
        const listingItem = await this.listingItemService.findOneByHash(data.params[0]);

        // if listingItem not found
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${data.params[0]} was not found!`);
            throw new NotFoundException(data.params[0]);
        } else {
            // find related bid
            // TODO: LATER WE WILL CHANGE IT FOR THE SINGLE BID
            const bid = listingItem.related('Bids').toJSON()[0];

            // if bid not found for the given listing item hash
            if (!bid) {
                this.log.warn(`Bid with the listing Item hash=${data.params[0]} was not found!`);
                throw new MessageException(`Bid not found for the listing item hash ${data.params[0]}`);

            } else if (bid.status === BidMessageType.MPA_BID) {

                // broadcast the accepted bid message
                await this.messageBroadcastService.broadcast({
                    item: data.params[0],
                    action: 'MPA_ACCEPT'
                } as BidMessage);

                // TODO: We will change the return data once broadcast functionality will be implemented
                return bid;

            } else {
                throw new MessageException(`Bid can not be accepted because it was already been ${bid.status}`);
            }
        }
    }

    public help(): string {
        return 'AcceptBidCommand: TODO: Fill in help string.';
    }
}
