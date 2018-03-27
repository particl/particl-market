import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
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
     * [1]: addressId (from profile deliveryaddresses)
     * [2]: bidDataId, string
     * [3]: bidDataValue, string
     * [4]: bidDataId, string
     * [5]: bidDataValue, string
     * ......
     *
     * @param data
     * @returns {Promise<Bookshelf<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        // get listing item hash it is in first argument in the data.params
        const listingItemHash = data.params.shift();

        // find listingItem by hash
        const listingItemModel = await this.listingItemService.findOneByHash(listingItemHash);
        const listingItem = listingItemModel.toJSON();

        return this.bidActionService.send(listingItem, data.params);
    }

    public usage(): string {
        return this.getName() + ' <itemhash> [(<bidDataId>, <bidDataValue>), ...] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to send bids for. \n'
            + '    <addressId>              - Numeric - The addressId of the related profile we want to use \n' // <--- TODO
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

}
