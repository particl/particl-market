// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { BidMessage } from '../../messages/action/BidMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { BuyerData, LockInfo } from 'omp-lib/dist/interfaces/omp';
import { EscrowLockMessage } from '../../messages/action/EscrowLockMessage';
import { EscrowMessageCreateParams } from './MessageCreateParams';

export class EscrowLockMessageFactory implements MessageFactoryInterface {

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
     *      memo?: string
     * @returns {Promise<EscrowLockMessage>}
     */
    public async get(params: EscrowMessageCreateParams): Promise<EscrowLockMessage> {

        const message = {
            type: MPAction.MPA_LOCK,
            bid: params.bidHash,
            buyer: {
                //
            } as BuyerData,
            info: {
                memo: params.memo
            } as LockInfo
        } as EscrowLockMessage;

        return message;
    }

}
