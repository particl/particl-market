// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidMessage } from '../../messages/action/BidMessage';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { OrderCreateParams} from './ModelCreateParams';
import { OrderCreateRequest } from '../../requests/model/OrderCreateRequest';
import { OrderItemCreateRequest } from '../../requests/model/OrderItemCreateRequest';
import { OrderItemStatus } from '../../enums/OrderItemStatus';

export class OrderFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a OrderCreateRequest
     *
     * @param params
     * @param bidMessage
     * @param smsgMessage
     */
    public async get(params: OrderCreateParams, bidMessage?: BidMessage, smsgMessage?: resources.SmsgMessage): Promise<OrderCreateRequest> {
        const orderItems: OrderItemCreateRequest[] = this.getOrderItems(params.bids);
        return {
            address_id: params.addressId,
            buyer: params.buyer,
            seller: params.seller,
            orderItems
        } as OrderCreateRequest;
    }

    /**
     * TODO: currently supports only one OrderItem per Order
     *
     * @param bids
     */
    private getOrderItems(bids: resources.Bid[]): OrderItemCreateRequest[] {

        const orderItemCreateRequests: OrderItemCreateRequest[] = [];
        for (const bid of bids) {
            const orderItemCreateRequest = {
                // order_id
                bid_id: bid.id,
                itemHash: bid.ListingItem.hash,
                status: OrderItemStatus.BIDDED
            } as OrderItemCreateRequest;

            orderItemCreateRequests.push(orderItemCreateRequest);
        }
        return orderItemCreateRequests;
    }

}
