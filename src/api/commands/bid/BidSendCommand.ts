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
import { SmsgService } from '../../services/SmsgService';
import { BidMessageType } from '../../enums/BidMessageType';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { BidActionService } from '../../services/BidActionService';

export class BidSendCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.BidActionService) private bidActionService: BidActionService
    ) {
        super(Commands.BID_SEND);
        this.log = new Logger(__filename);
    }

    /**
     * Posts a Bid to the network
     *
     * data.params[]:
     * [0]: itemhash, string
     * [1]: bidDataId, string
     * [2]: bidDataValue, string
     * [3]: bidDataId, string
     * [4]: bidDataValue, string
     * ......
     *
     * @param data
     * @returns {Promise<Bookshelf<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        // find listingItem by hash
        const listingItemModel = await this.listingItemService.findOneByHash(data.params[0]);
        const listingItem = listingItemModel.toJSON();

        // if listingItem not found
        if (listingItem === null) {
            this.log.warn(`ListingItem with the hash=${data.params[0]} was not found!`);
            throw new NotFoundException(data.params[0]);
        } else {
            // get listing item hash it is in first argument in the data.params
            const listingItemHash = data.params.shift();

            // convert the bid data params as bid data key value pair
            const bidData = this.getBidData(data.params);

            return this.bidActionService.send(listingItem, bidData);
        }
    }

    public usage(): string {
        return this.getName() + ' <itemhash> [(<bidDataId>, <bidDataValue>), ...] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to send bids for. \n'
            + '    <bidDataId>              - [optional] Numeric - The id of the bid we want to send. \n'
            + '    <bidDataValue>           - [optional] String - The value of the bid we want to send. ';
    }

    public description(): string {
        return 'Send bid.';
    }

    public example(): string {
        return '';
        // return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb 1 [TODO] ';
    }

    /**
     * data[]:
     * [0]: id, string
     * [1]: value, string
     * [2]: id, string
     * [3]: value, string
     * ..........
     */
    private getBidData(data: string[]): string[] {
        const bidData = [] as any;

        // convert the bid data params as bid data key value pair
        for ( let i = 0; i < data.length; i += 2 ) {
          bidData.push({id: data[i], value: data[i + 1]});
        }
        return bidData;
    }

}
