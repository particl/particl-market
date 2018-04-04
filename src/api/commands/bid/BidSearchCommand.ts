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
     * [0]: ListingItem hash, string
     * [1]: status, [Optional] ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL}
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Bid>> {

        // if hash is specified
        if (data.params[0]) {
            const listingItem = await this.listingItemService.findOneByHash(data.params[0]);

            return this.bidService.search({
                listingItemId: listingItem.id,
                action: data.params[1]
            } as BidSearchParams);
        } else {
            // searching all bids
            return this.bidService.findAll();
        }
    }


    public usage(): string {
        return this.getName() + ' [<itemhash> [<status>]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - [optional] String - The hash of the item we want to search bids for. \n'
            + '    <status>                 - [optional] ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL} - \n'
            + '                                The status of the bids we want to search for. ';
    }

    public description(): string {
            return 'Search bids by itemhash or bid status';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb MPA_ACCEPT ';
    }
}
