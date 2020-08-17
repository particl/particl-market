// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ValidationException } from '../exceptions/ValidationException';
import { MPM} from 'omp-lib/dist/interfaces/omp';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { FV_MPA_BID } from 'omp-lib/dist/format-validators/mpa_bid';
import { decorate, injectable } from 'inversify';
import { ActionDirection } from '../enums/ActionDirection';
import { MessageException } from '../exceptions/MessageException';
import { ActionMessageObjects } from '../enums/ActionMessageObjects';
import { KVS } from 'omp-lib/dist/interfaces/common';

decorate(injectable(), FV_MPA_BID);
export class BidValidator extends FV_MPA_BID implements ActionMessageValidatorInterface {

    constructor() {
        super();
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (message.action.type !== MPAction.MPA_BID) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_BID]);
        }

        this.keyExists(ActionMessageObjects.BID_ON_MARKET, message.action.objects);
        this.keyExists(ActionMessageObjects.ORDER_HASH, message.action.objects);

        // omp-lib doesnt support all the ActionMessageTypes which the market supports, so msg needs to be cast to MPM
        return FV_MPA_BID.validate(message as MPM);
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        return true;
    }

    private keyExists(keyToFind: string, values: KVS[] = []): boolean {
        const kvsValue = _.find(values, (kvs: KVS) => {
            return kvs.key === keyToFind;
        });
        if (_.isEmpty(kvsValue)) {
            throw new MessageException('Missing ActionMessageObjects.' + keyToFind + '.');
        }
        return true;
    }
}
