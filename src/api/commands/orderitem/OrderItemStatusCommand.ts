// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SearchOrder } from '../../enums/SearchOrder';
import { OrderItemStatusResponse } from '../../../core/helpers/OrderItemStatusResponse';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BidSearchOrderField } from '../../enums/SearchOrderField';
import { BidSearchParams } from '../../requests/search/BidSearchParams';
import { BidService } from '../../services/model/BidService';
import { OrderItemService } from '../../services/model/OrderItemService';
import { CommandParamValidationRules, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';

export class OrderItemStatusCommand extends BaseCommand implements RpcCommandInterface<OrderItemStatusResponse[]> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.ORDERITEM_STATUS);
        this.log = new Logger(__filename);
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new StringValidationRule('itemhash', false),
                new StringValidationRule('buyer', false),
                new StringValidationRule('seller', false)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: itemhash, string
     *  [1]: buyer, string
     *  [2]: seller, string
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<OrderItemStatusResponse[]> {
        const itemHash = data.params[0];
        const buyer = data.params[1];
        const seller = data.params[2];

        const searchParams = {
            page: 0, pageLimit: 100, order: SearchOrder.ASC, orderField: BidSearchOrderField.CREATED_AT,
            type: MPAction.MPA_BID,
            bidders: !_.isNil(buyer) ? [buyer] : undefined
            // todo: add sellers + itemHash
        } as BidSearchParams;

        let mpaBids: resources.Bid[] = await this.bidService.search(searchParams).then(value => value.toJSON());

        if (!_.isNil(seller)) {
            mpaBids = _.filter(mpaBids, bid => {
                return bid.ListingItem.seller === seller;
            });
        }

        if (!_.isNil(itemHash)) {
            mpaBids = _.filter(mpaBids, bid => {
                return bid.ListingItem.hash === itemHash;
            });
        }

        const orderItemStatuses: OrderItemStatusResponse[] = [];

        for (const bid of mpaBids) {
            const orderItemStatus = {
                listingItemId: bid.ListingItem.id,
                listingItemHash: bid.ListingItem.hash,
                bidType: bid.type,
                orderStatus: bid.OrderItem.status,
                buyer: bid.bidder,
                seller: bid.ListingItem.seller
            } as OrderItemStatusResponse;

            if (!_.isEmpty(bid.ChildBids)) {
                const childBidsOrdered = _.orderBy(bid.ChildBids, ['createdAt'], ['asc']);
                orderItemStatus.bidType = childBidsOrdered[0].type;
            }
            orderItemStatuses.push(orderItemStatus);
        }
        return orderItemStatuses;
    }

    /**
     *  [0]: itemhash, string, optional
     *  [1]: buyer, string, optional
     *  [2]: seller, string, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);
        return data;
    }

    // tslint:disable:max-line-length
    public usage(): string {
        return this.getName() + ' [itemhash] [buyer] [seller]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '<itemHash> - Optional, The hash of the OrderItem we want to get the status of. \n'
            + '<buyer>    - Optional, The buyer of the OrderItems we want to get the status of. \n'
            + '<seller>   - Optional, The seller of the OrderItems we want to get the status of. \n';
    }

    // tslint:enable:max-line-length

    public description(): string {
        return 'Fetch statuses of OrderItems specified by given searchBy params. Shows the first 100 orders.';
    }

    public example(): string {
        return 'orderitem ' + this.getName() + ' ';
    }

}
