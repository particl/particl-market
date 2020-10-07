// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableBidMessageConfig } from '../hashableconfig/message/HashableBidMessageConfig';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { OrderItemShipMessage } from '../../messages/action/OrderItemShipMessage';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { OrderItemShipRequest } from '../../requests/action/OrderItemShipRequest';
import { BaseMessageFactory } from '../BaseMessageFactory';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';

export class OrderItemShipMessageFactory extends BaseMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super();
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param actionRequest
     * @returns {Promise<MarketplaceMessage>}
     */
    public async get(actionRequest: OrderItemShipRequest): Promise<MarketplaceMessage> {

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

        return await this.getMarketplaceMessage(message);
    }
}
