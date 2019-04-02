// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { BuyerData } from 'omp-lib/dist/interfaces/omp';
import { EscrowMessageCreateParams } from './MessageCreateParams';
import { EscrowRefundMessage } from '../../messages/actions/EscrowRefundMessage';

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
    public async get(params: EscrowMessageCreateParams): Promise<EscrowRefundMessage> {

        const message = {
            type: MPAction.MPA_REFUND,
            bid: params.bidHash,
            buyer: {
                //
            } as BuyerData
        } as EscrowRefundMessage;

        return message;
    }

}
