// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
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
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ListingItemService } from '../../services/model/ListingItemService';
import { MarketService } from '../../services/model/MarketService';
import {
    CommandParamValidationRules,
    IdValidationRule,
    OrderStatusOrOrderItemStatusValidationRule,
    ParamValidationRule,
    StringValidationRule
} from '../CommandParamValidation';


export class OrderSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<Order>> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) private orderService: OrderService
    ) {
        super(Commands.ORDER_SEARCH);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('listingItemId', false, this.listingItemService),
                new OrderStatusOrOrderItemStatusValidationRule(false),
                new StringValidationRule('buyerAddress', false),
                new StringValidationRule('sellerAddress', false),
                new StringValidationRule('market', false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
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
     *  [4]: listingItem, resources.ListingItem, optional
     *  [5]: status, OrderStatus or OrderItemStatus, optional
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
        const listingItem: resources.ListingItem = data.params[4];
        const status = data.params[5];
        const buyerAddress = data.params[6];
        const sellerAddress = data.params[7];
        const market = data.params[8];

        const orderSearchParams = {
            page, pageLimit, order, orderField,
            listingItemId: !_.isNil(listingItem) ? listingItem.id : undefined,
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
     *  [5]: status, OrderStatus or OrderItemStatus, optional
     *  [6]: buyerAddress, string, optional
     *  [7]: sellerAddress, string, optional
     *  [8]: market, string, optional
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data); // validates the basic search params, see: BaseSearchCommand.validateSearchParams()

        const market = data.params[8];                                  // optional

        if (!_.isNil(market)) {
            await this.marketService.findAllByReceiveAddress(market)
                .then(results => {
                    const markets: resources.Market[] = results.toJSON();
                    if (_.isEmpty(markets)) {
                        throw new ModelNotFoundException('Market');
                    }
                });
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' [listingItemId] [status] [buyerAddress] [sellerAddress] [market]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + '\n'
            + '    <page>                   - number - The number of result page we want to return. \n'
            + '    <pageLimit>              - number - The number of results per page. \n'
            + '    <order>                  - SearchOrder - The order of the returned results. \n'
            + '    <orderField>             - SearchOrderField - The field to order the results by. \n'
            + '    <listingItemId>          - [optional] string - The Id of the ListingItem. \n'
            + '    <status>                 - [optional] OrderStatus|OrderItemStatus - The status.\n'
            + '    <buyerAddress>           - [optional] string - The address of the buyer. \n'
            + '    <sellerAddress>          - [optional] string - The address of the seller. \n'
            + '    <market>                 - [optional] string - The market receiveAddress. \n';
    }

    public description(): string {
        return 'Search for Orders by listingItemId, orderItemStatus, or addresses. ';
    }

    public example(): string {
        return 'order ' + this.getName() + ' 0 10 \'ASC\' \'FIELD\' 1'
            + ' AWAITING_ESCROW pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj1 pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj2';
    }

}
