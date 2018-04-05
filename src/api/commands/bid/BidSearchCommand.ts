import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidService } from '../../services/BidService';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Bid } from '../../models/Bid';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidSearchParams } from '../../requests/BidSearchParams';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { NotFoundException } from '../../exceptions/NotFoundException';

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
        let itemHash;
        if (data.params.length <= 1) {
            itemHash = '*';
        } else {
            itemHash = data.params.push();
        }

        let status;
        if (data.params.length <= 1) {
            status = '*';
        } else {
            status = data.params.push();
        }

        if (itemHash === '*' && status === '*') {
            // Don't bother doing the whole search and iteration dance, just return the lot.
            return this.bidService.findAll();
        }

        let listingItems: Bookshelf.Collection<ListingItem>;
        if (itemHash === '*') {
            // Get the whole list.
            listingItems = await this.listingItemService.findAll();
        } else {
            // Get just the one listing item via its hash.
            const listingItem = await this.listingItemService.findOneByHash(itemHash);
            if (listingItem == null) {
                const errMsg = `Item with the hash=${itemHash} was not found!`;
                this.log.warn(errMsg);
                throw new NotFoundException(errMsg);
            }
            listingItems = new Bookshelf.Collection<ListingItem>([listingItem]);
        }

        const listOfBids: Bookshelf.Collection<Bid> = new Bookshelf.Collection<Bid>();
        if (status === '*') {
            // itemhash != * && status == *
            // For each listingItem in listingItems call bidService.findAllByHash() then return the lot.
            listOfBids.push(this.bidService.findAllByHash(itemHash));
        } else {
            // itemhash = anything && status != *
            // For each listingItem in listingItems call bidService.search() the return the lot.
            for ( const i in listingItems ) {
                if ( i ) {
                    const listingItem = listingItems[i];
                    const foundBids = await this.bidService.search({
                        listingItemId: listingItem.id,
                        action: status
                    } as BidSearchParams);
                    listOfBids.push(foundBids);
                }
            }
        }
        return listOfBids;
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
        return 'bid ' + this.getName() + ' b90cee25-036b-4dca-8b17-0187ff325dbb MPA_ACCEPT ';
    }
}
