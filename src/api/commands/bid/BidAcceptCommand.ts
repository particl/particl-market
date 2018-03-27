import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidFactory } from '../../factories/BidFactory';
import { ListingItemService } from '../../services/ListingItemService';
import { SmsgService } from '../../services/SmsgService';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { CoreRpcService } from '../../services/CoreRpcService';
import { BidActionService } from '../../services/BidActionService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
declare function unescape(s: string): string;


export class BidAcceptCommand extends BaseCommand implements RpcCommandInterface<SmsgSendResponse> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.BidActionService) private bidActionService: BidActionService,
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory
    ) {
        super(Commands.BID_ACCEPT);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: itemhash, string
     * @param data
     * @returns {Promise<Bookshelf<Bid>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<SmsgSendResponse> {

        // find listingItem by hash
        const listingItemModel = await this.listingItemService.findOneByHash(data.params[0]);
        const listingItem = listingItemModel.toJSON();

        // make sure we have a ListingItemTemplate, so we know it's our item
        if (_.isEmpty(listingItem.ListingItemTemplate)) {
            throw new MessageException('Not your item.');
        }

        return {} as SmsgSendResponse; // this.bidActionService.accept(listingItem);
    }

    public usage(): string {
        return this.getName() + ' <itemhash> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to accept. ';
    }

    public description(): string {
        return 'Accept bid.';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb ';
    }
}
