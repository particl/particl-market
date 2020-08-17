// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableBidMessageConfig } from '../hashableconfig/message/HashableBidMessageConfig';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BidRejectMessage } from '../../messages/action/BidRejectMessage';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { BidRejectRequest } from '../../requests/action/BidRejectRequest';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { BaseMessageFactory } from './BaseMessageFactory';

export class BidRejectMessageFactory extends BaseMessageFactory {

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
     * @returns {Promise<BidRejectMessage>}
     */
    public async get(actionRequest: BidRejectRequest): Promise<MarketplaceMessage> {
        const message = {
            type: MPAction.MPA_REJECT,
            generated: +Date.now(),
            hash: 'recalculateandvalidate',
            bid: actionRequest.bid.hash                 // hash of MPA_BID
        } as BidRejectMessage;

        if (actionRequest.reason) {
            message.objects = [] as KVS[];
            message.objects.push({
                key: ActionMessageObjects.BID_REJECT_REASON,
                value: actionRequest.reason
            } as KVS);
        }

        message.hash = ConfigurableHasher.hash(message, new HashableBidMessageConfig());

        return await this.getMarketplaceMessage(message);
    }
}
