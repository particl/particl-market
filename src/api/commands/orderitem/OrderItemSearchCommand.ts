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
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { Order } from '../../models/Order';
import { BaseSearchCommand } from '../BaseSearchCommand';
import { EnumHelper } from '../../../core/helpers/EnumHelper';
import { OrderItemSearchOrderField } from '../../enums/SearchOrderField';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { OrderItem } from '../../models/OrderItem';
import { OrderItemService } from '../../services/model/OrderItemService';
import { OrderItemSearchParams } from '../../requests/search/OrderItemSearchParams';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ListingItemService } from '../../services/model/ListingItemService';
import { MarketService } from '../../services/model/MarketService';
import { CommandParamValidationRules, EnumValidationRule, IdValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';


export class OrderItemSearchCommand extends BaseSearchCommand implements RpcCommandInterface<Bookshelf.Collection<OrderItem>> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) private orderItemService: OrderItemService
    ) {
        super(Commands.ORDERITEM_SEARCH);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('listingItemId', false),
                new EnumValidationRule('orderItemStatus', false, 'OrderItemStatus', EnumHelper.getValues(OrderItemStatus) as string[]),
                new StringValidationRule('buyerAddress', false),
                new StringValidationRule('sellerAddress', false),
                new StringValidationRule('market', false)

            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    public getAllowedSearchOrderFields(): string[] {
        return EnumHelper.getValues(OrderItemSearchOrderField) as string[];
    }

    /**
     * data.params[]:
     *  [0]: page, number, 0-based
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: orderField, SearchOrderField, field to which the SearchOrder is applied
     *  [4]: listingItem, resources.ListingItem, optional
     *  [5]: status, OrderItemStatus, optional
     *  [6]: buyerAddress, string, optional
     *  [7]: sellerAddress, string, optional
     *  [8]: market, string, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<Bookshelf.Collection<Order>>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<OrderItem>> {

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
            listingItemId: listingItem.id,
            status,
            buyerAddress,
            sellerAddress,
            market
        } as OrderItemSearchParams;

        return await this.orderItemService.search(orderSearchParams);
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

        let listingItemId = data.params[4];       // optional
        let status = data.params[5];              // optional
        let buyerAddress = data.params[6];        // optional
        let sellerAddress = data.params[7];       // optional
        let market = data.params[8];              // optional

        // * -> undefined
        listingItemId = listingItemId !== '*' ? listingItemId : undefined;

        if (status === '*') {
            status = undefined;
        }
        if (status && !EnumHelper.containsName(OrderItemStatus, status)) {
            throw new InvalidParamException('status', 'OrderItemStatus');
        }

        buyerAddress = buyerAddress !== '*' ? buyerAddress : undefined;
        sellerAddress = sellerAddress !== '*' ? sellerAddress : undefined;
        market = market !== '*' ? market : undefined;

        if (!_.isNil(listingItemId)) {
            // make sure ListingItemTemplate with the id exists
            data.params[4] = await this.listingItemService.findOne(listingItemId)
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItem');
                });
        }

        if (!_.isNil(market)) {
            await this.marketService.findAllByReceiveAddress(market)
                .then(results => {
                    const markets: resources.Market[] = results.toJSON();
                    if (_.isEmpty(markets)) {
                        throw new ModelNotFoundException('Market');
                    }
                });
        }

        data.params[5] = status;
        data.params[6] = buyerAddress;
        data.params[7] = sellerAddress;
        data.params[8] = market;

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
        return 'Search for OrderItems by listingItemId, orderItemStatus, or addresses. ';
    }

    public example(): string {
        return 'order ' + this.getName() + ' 0 10 \'ASC\' \'FIELD\' 1'
            + ' AWAITING_ESCROW pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj1 pmZpGbH2j2dDYU6LvTryHbEsM3iQzxpnj2';
    }

}
