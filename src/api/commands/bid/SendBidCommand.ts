import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidMessage } from '../../messages/BidMessage';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { BidFactory } from '../../factories/BidFactory';
import { Bid } from '../../models/Bid';
import { MessageBroadcastService } from '../../services/MessageBroadcastService';
import { BidMessageType } from '../../enums/BidMessageType';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class SendBidCommand extends BaseCommand implements RpcCommandInterface<Bid> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.MessageBroadcastService) private messageBroadcastService: MessageBroadcastService,
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory
    ) {
        super(Commands.DATA_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: hash, string
     * [1]: id, string
     * [2]: value, string
     * [3]: id, string
     * [4]: value, string
     * ......
     *
     * @param data
     * @returns {Promise<Bookshelf<void>}
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
            // get listing item hash it is in first argument in the data.params
            const listingItemHash = data.params.shift();

            // convert the bid data params as bid data key value pair
            const bidData = this.setBidData(data.params);
            // broadcast the message in to the network
            await this.messageBroadcastService.broadcast({
              objects: bidData,
              listing: listingItemHash,
              action: BidMessageType.MPA_BID
            } as BidMessage);

            // TODO: We will change the return data once broadcast functionality will be implemented
            return data;
        }
    }

    public help(): string {
        return this.getName() + ' <TODO>';
    }

    /**
     * data[]:
     * [0]: id, string
     * [1]: value, string
     * [2]: id, string
     * [3]: value, string
     * ..........
     */
    private setBidData(data: string[]): string[] {
        const bidData = [] as any;

        // convert the bid data params as bid data key value pair
        for ( let i = 0; i < data.length; i += 2 ) {
          bidData.push({id: data[i], value: data[i + 1]});
        }
        return bidData;
    }

}
