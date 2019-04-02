// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { BidMessage } from '../../messages/actions/BidMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import {BuyerData, SellerData} from 'omp-lib/dist/interfaces/omp';
import {EscrowRefundMessageCreateParams, EscrowReleaseMessageCreateParams} from './MessageCreateParams';
import { EscrowRefundMessage } from '../../messages/actions/EscrowRefundMessage';
import {EscrowReleaseMessage} from '../../messages/actions/EscrowReleaseMessage';

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
            type: MPAction.MPA_RELEASE,
            bid: params.bidHash,
            seller: {
                //
            } as SellerData
        } as EscrowReleaseMessage;

        return message;
    }

}
