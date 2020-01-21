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

/**
 *
 */
decorate(injectable(), FV_MPA_BID);
export class BidValidator extends FV_MPA_BID implements ActionMessageValidatorInterface {

    constructor() {
        super();
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (message.action.type !== MPAction.MPA_BID) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_BID]);
        }

        const marketAddress = _.find(message.action.objects || [], (kvs: KVS) => {
            return kvs.key === ActionMessageObjects.BID_ON_MARKET;
        });
        if (_.isEmpty(marketAddress)) {
            throw new MessageException('Missing ActionMessageObjects.BID_ON_MARKET.');
        }

        const orderHash = _.find(message.action.objects || [], (kvs: KVS) => {
            return kvs.key === ActionMessageObjects.ORDER_HASH;
        });
        if (_.isEmpty(orderHash)) {
            throw new MessageException('Missing ActionMessageObjects.ORDER_HASH.');
        }

        // omp-lib doesnt support all the ActionMessageTypes which the market supports, so msg needs to be cast to MPM
        return FV_MPA_BID.validate(message as MPM);
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        return true;
    }

    // TODO: move to util
    private getKVSValueByKey(values: resources.BidData[] | KVS[], keyToFind: string): string | number | undefined {
        const kvsValue = _.find(values, value => {
            return value.key === keyToFind;
        });
        return kvsValue ? kvsValue.value : undefined;
    }
}
