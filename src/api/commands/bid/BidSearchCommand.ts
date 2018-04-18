import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import * as _ from 'lodash';
import { BidService } from '../../services/BidService';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Bid } from '../../models/Bid';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidSearchParams } from '../../requests/BidSearchParams';
import { SearchOrder } from '../../enums/SearchOrder';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { BidMessageType } from '../../enums/BidMessageType';

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
     * [1]: status/action, ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL}, * for all
     * [2]: ordering ASC/DESC, orders by createdAt
     * [3...]: bidder: particl address
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Bid>> {

        const listingItemHash = data.params[0] !== '*' ? data.params[0] : undefined;
        const action = data.params[1] !== '*' ? data.params[1] : undefined;
        const ordering = data.params[2] ? data.params[2] : SearchOrder.ASC;

        // TODO: ordering is by createdAt, but perhaps updatedAt would be better

        if (data.params.length >= 3) {
            // shift so that data.params contains only the bidders
            data.params.shift();
            data.params.shift();
            data.params.shift();
        } else {
            // no bidders
            data.params = [];
        }

        const bidSearchParams = {
            listingItemHash,
            action,
            ordering,
            bidders: data.params
        } as BidSearchParams;

        this.log.debug('bidSearchParams', bidSearchParams);

        if (!_.includes([
                BidMessageType.MPA_BID,
                BidMessageType.MPA_ACCEPT,
                BidMessageType.MPA_REJECT,
                BidMessageType.MPA_CANCEL,
                undefined
            ], bidSearchParams.action)) {
            throw new MessageException('Invalid BidMessageType: ' + bidSearchParams.action);
        }

        if (!_.includes([
                SearchOrder.ASC,
                SearchOrder.DESC
            ], bidSearchParams.ordering)) {
            throw new MessageException('Invalid SearchOrder: ' + bidSearchParams.ordering);
        }

        return await this.bidService.search(bidSearchParams);
    }

    public usage(): string {
        return this.getName() + ' (<itemhash>|*) [(<status>|*) [<ordering> [<bidderAddress...]]] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <itemhash>               - String - The hash of the item we want to search bids for. \n'
            + '                                The value * specifies that status can be anything. \n'
            + '    <status>                 - [optional] ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL} - \n'
            + '                                The status of the bids we want to search for. \n'
            + '                                The value * specifies that status can be anything. \n'
            + '    <ordering>               - [optional] ENUM{ASC,DESC} - The ordering of the search results. \n'
            + '    <bidderAddress>          - [optional] String(s) - The address of the bidder we want to search bids for. ';
    }

    public description(): string {
            return 'Search bids by itemhash, bid status, or bidder address';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' a22c63bc16652bc417068754688e50f60dbf2ce6d599b4ccf800d63b504e0a88'
            + ' MPA_ACCEPT pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj1 pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj2';
    }
}
