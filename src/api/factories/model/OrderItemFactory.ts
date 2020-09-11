// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { ModelFactoryInterface } from '../ModelFactoryInterface';
import { OrderItemCreateParams } from '../ModelCreateParams';
import { OrderItemCreateRequest } from '../../requests/model/OrderItemCreateRequest';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { BidMessage } from '../../messages/action/BidMessage';


export class OrderItemFactory implements ModelFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * create OrderItemCreateRequest
     *
     * @param params
     */
    public async get(params: OrderItemCreateParams): Promise<OrderItemCreateRequest> {

        const actionMessage: BidMessage = params.actionMessage as BidMessage;
        const smsgMessage: resources.SmsgMessage | undefined = params.smsgMessage;

        const createRequest = {
            // order_id
            bid_id: params.bid.id,
            itemHash: params.bid.ListingItem.hash,
            status: !_.isNil(params.status) ? params.status : OrderItemStatus.BIDDED
        } as OrderItemCreateRequest;

        return createRequest;
    }
}
