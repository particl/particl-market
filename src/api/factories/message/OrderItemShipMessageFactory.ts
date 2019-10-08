// Copyright (c) 2017-2019, The Particl Market developers
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
import { OrderItemShipMessageCreateParams } from '../../requests/message/OrderItemShipMessageCreateParams';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';

export class OrderItemShipMessageFactory implements MessageFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param params
     *      bidHash: string
     * @returns {Promise<OrderItemShipMessage>}
     */
    public async get(params: OrderItemShipMessageCreateParams): Promise<OrderItemShipMessage> {
        const message = {
            type: MPActionExtended.MPA_SHIP,
            generated: +new Date().getTime(),
            hash: 'recalculateandvalidate',
            bid: params.bidHash                 // hash of MPA_BID
        } as OrderItemShipMessage;

        if (params.memo) {
            message.objects = [] as KVS[];
            message.objects.push({
                key: ActionMessageObjects.SHIPPING_MEMO,
                value: params.memo
            } as KVS);
        }

        message.hash = ConfigurableHasher.hash(message, new HashableBidMessageConfig());
        return message;
    }

}
