// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { BidMessage } from '../../messages/BidMessage';
import { IdValuePair } from '../../services/BidActionService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ActionMessageCreateParams } from './MarketplaceMessageFactory';
import { BidConfiguration } from 'omp-lib/dist/interfaces/configs';

export interface BidMessageCreateParams extends ActionMessageCreateParams {
    config: BidConfiguration;
}

export class BidMessageFactory {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     *
     * @param {MPAction} action
     * @param {string} itemHash
     * @param {IdValuePair[]} idValuePairObjects
     * @returns {Promise<BidMessage>}
     */
    public async get(action: MPAction, itemHash: string, idValuePairObjects?: IdValuePair[]): Promise<BidMessage> {

        const message = {
            action,
            item: itemHash,
            objects: idValuePairObjects
        } as BidMessage;

        return message;
    }

}
