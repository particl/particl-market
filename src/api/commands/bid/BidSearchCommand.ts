import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidService } from '../../services/BidService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Bid } from '../../models/Bid';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidSearchParams } from '../../requests/BidSearchParams';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class BidSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<Bid>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService
    ) {
        super(Commands.BID_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     * [0]: action, string
     * [1]: listingItemId, number
     * [2]: profileId, number
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: any): Promise<Bookshelf.Collection<Bid>> {
        return this.bidService.search({
            action: data.params[0],
            listingItemId: data.params[1],
            profileId: data.params[2]
        } as BidSearchParams);
    }

    public help(): string {
        return this.getName() + ' [<status> <listingItemId> <profileId>]\n'
            + '    <status>           - [optional] Enum{ACCEPTED,REJECTED,CANCELLED,ACTIVE} - The\n'
            + '                          status of the bids we\'re searching for.\n'
            + '    <listingItemId>    - [optional] Numeric - The ID of the listing item that the\n'
            + '                          bids we\'re searching for are associated with.\n'
            + '    <profileId>        - [optional] Numeric - The ID of the profile that made the\n'
            + '                          bids we\'re searching for [TODO confirm this is true].';
    }

}
