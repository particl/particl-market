// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableBidMessageConfig } from '../hashableconfig/message/HashableBidMessageConfig';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BidCancelMessage } from '../../messages/action/BidCancelMessage';
import { BidCancelRequest } from '../../requests/action/BidCancelRequest';

export class BidCancelMessageFactory implements MessageFactoryInterface {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param actionRequest
     * @returns {Promise<BidCancelMessage>}
     */
    public async get(actionRequest: BidCancelRequest): Promise<BidCancelMessage> {
        const message = {
            type: MPAction.MPA_CANCEL,
            generated: +Date.now(),
            hash: 'recalculateandvalidate',
            bid: actionRequest.bid.hash,                // hash of MPA_BID
            objects: [] as KVS[]
        } as BidCancelMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableBidMessageConfig());

        return message;
    }

}
