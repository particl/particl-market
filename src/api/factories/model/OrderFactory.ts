// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { ModelFactoryInterface } from './ModelFactoryInterface';
import { OrderCreateParams } from './ModelCreateParams';
import { OrderCreateRequest } from '../../requests/model/OrderCreateRequest';
import { OrderItemCreateRequest } from '../../requests/model/OrderItemCreateRequest';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableOrderCreateRequestConfig } from '../hashableconfig/createrequest/HashableOrderCreateRequestConfig';
import {HashableOrderField} from '../hashableconfig/HashableField';

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
     */
    public async get(params: OrderCreateParams/*, bidMessage?: BidMessage, smsgMessage?: resources.SmsgMessage*/): Promise<OrderCreateRequest> {

        const orderItemCreateRequests: OrderItemCreateRequest[] = this.getOrderItems(params.bids);

        const createRequest = {
            address_id: params.addressId,
            buyer: params.buyer,
            seller: params.seller,
            orderItems: orderItemCreateRequests,
            status: params.status,
            generatedAt: params.generatedAt,
            hash: params.hash
        } as OrderCreateRequest;

        this.log.debug('createRequest: ', JSON.stringify(createRequest, null, 2));

        // if we're the seller, we should receive the order hash from the buyer
        if (!createRequest.hash) {
            createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableOrderCreateRequestConfig());
        }

        return createRequest;
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
