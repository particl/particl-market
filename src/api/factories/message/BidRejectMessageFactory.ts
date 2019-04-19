// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableBidMessageConfig } from '../../messages/hashable/config/HashableBidMessageConfig';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BidRejectMessage } from '../../messages/action/BidRejectMessage';
import { BidRejectMessageCreateParams } from '../../requests/message/BidRejectMessageCreateParams';

export class BidRejectMessageFactory implements MessageFactoryInterface {

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
     * @returns {Promise<BidRejectMessage>}
     */
    public async get(params: BidRejectMessageCreateParams): Promise<BidRejectMessage> {
        const message = {
            type: MPAction.MPA_REJECT,
            generated: +new Date().getTime(),
            hash: 'recalculateandvalidate',
            bid: params.bidHash,                // hash of MPA_BID
            objects: [] as KVS[]
        } as BidRejectMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableBidMessageConfig());
        return message;
    }

}
