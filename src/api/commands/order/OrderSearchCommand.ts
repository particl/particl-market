// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { OrderService } from '../../services/model/OrderService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { Order } from '../../models/Order';
import { OrderSearchParams } from '../../requests/search/OrderSearchParams';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { OrderSearchOrderField } from '../../enums/SearchOrderField';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { CommentType } from '../../enums/CommentType';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class OrderSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<Order>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) private orderService: OrderService
    ) {
        super(Commands.ORDER_SEARCH);
        this.log = new Logger(__filename);
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(OrderSearchOrderField) as string[];
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: listingItemId, number, optional
     *  [5]: status, OrderItemStatus, optional
     *  [6]: buyerAddress, string, optional
     *  [7]: sellerAddress, string, optional
     *  [8]: market, string, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<Bookshelf.Collection<Order>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<Order>> {

        const page = data.params[0];
        const pageLimit = data.params[1];
        const order = data.params[2];
        const orderField = data.params[3];
        const listingItemId = data.params[4];
        const status = data.params[5];
        const buyerAddress = data.params[6];
        const sellerAddress = data.params[7];
        const market = data.params[8];

        const orderSearchParams = {
            page, pageLimit, order, orderField,
            listingItemId,
            status,
            buyerAddress,
            sellerAddress,
            market
        } as OrderSearchParams;

        return await this.orderService.search(orderSearchParams);
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: listingItemId, number, optional
     *  [5]: status, OrderItemStatus, optional // TODO: use OrderStatus
     *  [6]: buyerAddress, string, optional
     *  [7]: sellerAddress, string, optional
     *  [8]: market, string, optional
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const listingItemId = data.params[4];       // optional
        const status = data.params[5];              // optional
        const buyerAddress = data.params[6];        // optional
        const sellerAddress = data.params[7];       // optional
        const market = data.params[8];              // optional

        if (listingItemId && typeof listingItemId !== 'number') {
            throw new InvalidParamException('listingItemId', 'number');
        } else if (status && typeof status !== 'string') {
            throw new InvalidParamException('status', 'string');
        } else if (buyerAddress && typeof buyerAddress !== 'string') {
            throw new InvalidParamException('buyerAddress', 'string');
        } else if (sellerAddress && typeof sellerAddress !== 'string') {
            throw new InvalidParamException('sellerAddress', 'string');
        } else if (market && typeof market !== 'string') {
            throw new InvalidParamException('market', 'string');
        }

        // * -> undefined
        data.params[4] = listingItemId !== '*' ? listingItemId : undefined;
        if (status && !EnumHelper.containsName(OrderItemStatus, status)) {
            if (status === '*') {
                data.params[5] = undefined;
            }
            throw new InvalidParamException('type', 'CommentType');
        }
        data.params[6] = buyerAddress !== '*' ? buyerAddress : undefined;
        data.params[7] = sellerAddress !== '*' ? sellerAddress : undefined;
        data.params[8] = market !== '*' ? market : undefined;

        return data;
    }

    public usage(): string {
        return this.getName() + ' [listingItemId] [orderItemStatus] [buyerAddress] [sellerAddress]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - number - The number of result page we want to return. \n'
            + '    <pageLimit>              - number - The number of results per page. \n'
            + '    <order>                  - SearchOrder - The order of the returned results. \n'
            + '    <orderField>             - SearchOrderField - The field to order the results by. \n'
            + '    <listingItemId>          - [optional] string - The Id of the ListingItem. \n'
            + '    <orderItemStatus>        - [optional] OrderItemStatus - The status.\n'
            + '    <buyerAddress>           - [optional] string - The address of the buyer. \n'
            + '    <sellerAddress>          - [optional] string - The address of the seller. \n';
    }

    public description(): string {
        return 'Search for Orders by listingItemId, orderItemStatus, or addresses. ';
    }

    public example(): string {
        return 'order ' + this.getName() + ' 0 10 \'ASC\' \'FIELD\' 1'
            + ' AWAITING_ESCROW pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj1 pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj2';
    }

}
