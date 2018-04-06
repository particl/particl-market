import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidService } from '../../services/BidService';
import { ListingItemService } from '../../services/ListingItemService';
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
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService
    ) {
        super(Commands.BID_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     * [0]: ListingItem hash, string, * for all
     * [1]: status, ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL}, * for all
     * [2...]: bidder: particl address
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Bid>> {

        const listingItemHash = data.params[0];
        const action = data.params[1];

        if (data.params.length > 2) {
            data.params.shift();
            data.params.shift();
        }

        const searchArgs = {
            listingItemHash,
            action,
            bidders: data.params
        } as BidSearchParams;

        return await this.bidService.search(searchArgs);
    }


    public usage(): string {
        return this.getName() + ' (<itemhash>|*) [(<status>|*) [<bidderAddress> ...]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to search bids for. \n'
            + '                                The value * specifies that status can be anything. \n'
            + '    <status>                 - [optional] ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL} - \n'
            + '                                The status of the bids we want to search for. \n'
            + '                                The value * specifies that status can be anything. \n'
            + '    <bidderAddress>          - [optional] String - The address of the bidder we want to search bids for. ';
    }

    public description(): string {
            return 'Search bids by itemhash or bid status';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' a22c63bc16652bc417068754688e50f60dbf2ce6d599b4ccf800d63b504e0a88 MPA_ACCEPT pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnjV';
    }
}
