// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { EscrowReleaseMessage } from '../../messages/action/EscrowReleaseMessage';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { EscrowReleaseMessageCreateParams } from '../../requests/message/EscrowReleaseMessageCreateParams';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableBidReleaseField, HashableBidReleaseMessageConfig } from '../../messages/hashable/config/HashableBidReleaseMessageConfig';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';

export class EscrowReleaseMessageFactory implements MessageFactoryInterface {

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
     * @returns {Promise<EscrowReleaseMessage>}
     */
    public async get(params: EscrowReleaseMessageCreateParams): Promise<EscrowReleaseMessage> {


        const message = {
            type: MPActionExtended.MPA_RELEASE,
            generated: +new Date().getTime(),
            hash: 'recalculateandvalidate',
            bid: params.bidHash,                // hash of MPA_BID
            objects: [] as KVS[]
        } as EscrowReleaseMessage;

        message.hash = ConfigurableHasher.hash(message, new HashableBidReleaseMessageConfig());
        return message;
    }

}
