// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { OrderCreateParams, OrderItemCreateParams } from '../ModelCreateParams';
import { OrderCreateRequest } from '../../requests/model/OrderCreateRequest';
import { OrderItemCreateRequest } from '../../requests/model/OrderItemCreateRequest';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableOrderCreateRequestConfig } from '../hashableconfig/createrequest/HashableOrderCreateRequestConfig';
import { BidMessage } from '../../messages/action/BidMessage';
import { ActionDirection } from '../../enums/ActionDirection';
import { OrderStatus } from '../../enums/OrderStatus';
import { OrderItemFactory } from './OrderItemFactory';


export class OrderFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Factory) @named(Targets.Factory.model.OrderItemFactory) public orderItemFactory: OrderItemFactory
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create a OrderCreateRequest
     *
     * todo: supports only one OrderItem
     *
     * @param params
     */
    public async get(params: OrderCreateParams): Promise<OrderCreateRequest> {

        const actionMessage: BidMessage = params.actionMessage as BidMessage;
        const smsgMessage: resources.SmsgMessage | undefined = params.smsgMessage;

        // for now, params.bids only contains a single bid for single listingItem
        const orderItemCreateRequests: OrderItemCreateRequest[] = [];
        for (const bid of params.bids) {
            const orderItemCreateRequest: OrderItemCreateRequest = await this.orderItemFactory.get({
                // actionMessage,
                // smsgMessage,
                bid,
                status: OrderItemStatus.BIDDED
            } as OrderItemCreateParams);
            orderItemCreateRequests.push(orderItemCreateRequest);
        }

        const createRequest = {
            address_id: params.bids[0].ShippingAddress.id,
            buyer: params.bids[0].bidder,                      // smsgMessage.from
            seller: params.bids[0].ListingItem.seller,         // smsgMessage.to
            orderItems: orderItemCreateRequests,
            status: !_.isNil(smsgMessage) && smsgMessage.direction === ActionDirection.INCOMING ? OrderStatus.RECEIVED : OrderStatus.SENT,
            generatedAt: params.bids[0].generatedAt,
            hash: params.hash
        } as OrderCreateRequest;

        // this.log.debug('createRequest: ', JSON.stringify(createRequest, null, 2));

        // if we're the seller, we should have received the order hash from the buyer
        if (_.isNil(params.hash)) {
            createRequest.hash = ConfigurableHasher.hash(createRequest, new HashableOrderCreateRequestConfig());
        }

        return createRequest;
    }
}
