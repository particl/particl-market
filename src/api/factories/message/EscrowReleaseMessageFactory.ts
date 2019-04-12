// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Types } from '../../../constants';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MessageFactoryInterface } from './MessageFactoryInterface';
import { SellerData} from 'omp-lib/dist/interfaces/omp';
import { EscrowMessageCreateParams } from './MessageCreateParams';
import { EscrowReleaseMessage } from '../../messages/action/EscrowReleaseMessage';
import { MPActionExtended } from '../../enums/MPActionExtended';

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
    public async get(params: EscrowMessageCreateParams): Promise<EscrowReleaseMessage> {

        const message = {
            type: MPActionExtended.MPA_RELEASE,
            bid: params.bidHash,
            seller: {
                //
            } as SellerData
        } as EscrowReleaseMessage;

        return message;
    }

}
