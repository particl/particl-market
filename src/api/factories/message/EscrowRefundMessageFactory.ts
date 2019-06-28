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
import { EscrowRefundMessage } from '../../messages/action/EscrowRefundMessage';
import { EscrowRefundMessageCreateParams } from '../../requests/message/EscrowRefundMessageCreateParams';

export class EscrowRefundMessageFactory implements MessageFactoryInterface {

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
     * @returns {Promise<EscrowRefundMessage>}
     */
    public async get(params: EscrowRefundMessageCreateParams): Promise<EscrowRefundMessage> {
        const message = {
            type: MPActionExtended.MPA_REFUND,
            generated: +new Date().getTime(),
            hash: 'recalculateandvalidate',
            bid: params.bidHash,                // hash of MPA_BID
            objects: [] as KVS[]
        } as EscrowRefundMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableBidMessageConfig());
        return message;
    }

}
