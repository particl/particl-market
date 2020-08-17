// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableBidMessageConfig } from '../hashableconfig/message/HashableBidMessageConfig';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { OrderItemShipMessage } from '../../messages/action/OrderItemShipMessage';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { OrderItemShipRequest } from '../../requests/action/OrderItemShipRequest';

export class OrderItemShipMessageFactory implements MessageFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param actionRequest
     * @returns {Promise<OrderItemShipMessage>}
     */
    public async get(actionRequest: OrderItemShipRequest): Promise<OrderItemShipMessage> {

        const message = {
            type: MPActionExtended.MPA_SHIP,
            generated: +Date.now(),
            hash: 'recalculateandvalidate',
            bid: actionRequest.bid.hash,                 // hash of MPA_BID
            objects: actionRequest.memo ? [{
                key: ActionMessageObjects.SHIPPING_MEMO,
                value: actionRequest.memo
            }] as KVS[] : [] as KVS[]
        } as OrderItemShipMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableBidMessageConfig());
        return message;
    }

}
