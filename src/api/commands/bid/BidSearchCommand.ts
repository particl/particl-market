// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidService } from '../../services/model/BidService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { Bid } from '../../models/Bid';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { BidSearchParams } from '../../requests/search/BidSearchParams';
import { Commands} from '../CommandEnumType';
import { MessageException } from '../../exceptions/MessageException';
import { OrderItemStatus} from '../../enums/OrderItemStatus';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { BidSearchOrderField } from '../../enums/SearchOrderField';

export class BidSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<Bid>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService
    ) {
        super(Commands.BID_SEARCH);
        this.log = new Logger(__filename);
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(BidSearchOrderField) as string[];
    }

    /**
     *
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: listingItemId, number, optional
     *  [5]: type, ActionMessageTypes, optional
     *  [6]: searchString, string, optional
     *  [7...]: bidder: particl address, optional
     *
     * @param data
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Bid>> {

        const page = data.params[0];
        const pageLimit = data.params[1];
        const order = data.params[2];
        const orderField = data.params[3];
        const listingItemId = data.params[4];
        const type = data.params[5];
        const searchString = data.params[6];

        // TODO: maybe we should also add support for bid expiry at some point

        if (data.params[6]) {
            // shift so that data.params contains only the bidders
            data.params.shift();
            data.params.shift();
            data.params.shift();
            data.params.shift();
            data.params.shift();
            data.params.shift();
        } else {
            // no bidders
            data.params = [];
        }

        const bidSearchParams = {
            page, pageLimit, order, orderField,
            listingItemId,
            type,
            searchString,
            bidders: data.params
        } as BidSearchParams;

        return await this.bidService.search(bidSearchParams);
    }

    /**
     *
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: listingItemId, number, optional
     *  [5]: type, ActionMessageTypes, optional
     *  [6]: searchString, string, optional
     *  [7...]: bidder: particl address, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const listingItemId = data.params[4];       // optional
        const type = data.params[5];                // optional
        const searchString = data.params[6];        // optional

        // * -> undefined
        data.params[4] = listingItemId !== '*' ? listingItemId : undefined;
        data.params[5] = type ? this.validateStatus(type) : undefined;
        data.params[6] = searchString !== '*' ? searchString : undefined;

        return data;
    }

    public usage(): string {
        return this.getName()
            + ' <page> <pageLimit> <order> <orderField> [listingItemId] [type] [searchString] [bidderAddress...] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - number - The number of result page we want to return. \n'
            + '    <pageLimit>              - number - The number of results per page. \n'
            + '    <order>                  - SearchOrder - The order of the returned results. \n'
            + '    <orderField>             - CommentSearchOrderField - The field to order the results by. \n'
            + '    <listingItemId>          - string - The Id of the ListingItemId we want to searchBy bids for. \n'
            + '    <type>                   - [optional] ENUM{MPA_BID, MPA_ACCEPT, MPA_REJECT, MPA_CANCEL} - \n'
            + '                             - or ENUM{AWAITING_ESCROW, ESCROW_LOCKED, SHIPPING, COMPLETE} - \n'
            + '                                The status of the Bids we want to searchBy for. \n'
            + '    <searchString>           - [optional] string - A string that is used to \n'
            + '                                find Bids related to ListingItems by their titles and descriptions. \n'
            + '    <bidderAddress>          - [optional] string(s) - The addresses of the bidders we want to searchBy bids for. ';

    }

    public description(): string {
            return 'Search Bids by listingItemId, type, or bidder address';
    }

    public example(): string {
        return 'bid ' + this.getName() + ' 0 10 \'ASC\' \'FIELD\' 1'
            + ' MPA_ACCEPT pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj1 pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj2';
    }

    private validateStatus(status: string): MPAction | OrderItemStatus | undefined {
        switch (status) {
            case 'MPA_BID':
                return MPAction.MPA_BID;
            case 'MPA_ACCEPT':
                return MPAction.MPA_ACCEPT;
            case 'MPA_REJECT':
                return MPAction.MPA_REJECT;
            case 'MPA_CANCEL':
                return MPAction.MPA_CANCEL;
            case 'AWAITING_ESCROW':
                return OrderItemStatus.AWAITING_ESCROW;
            case 'ESCROW_LOCKED':
                return OrderItemStatus.ESCROW_LOCKED;
            case 'ESCROW_COMPLETED':
                return OrderItemStatus.ESCROW_COMPLETED;
            case 'SHIPPING':
                return OrderItemStatus.SHIPPING;
            case 'COMPLETE':
                return OrderItemStatus.COMPLETE;
            case '*':
                return undefined;
            default:
                throw new MessageException('Invalid status.');
        }
    }
}
