// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../MarketplaceMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ValidationException } from '../../exceptions/ValidationException';
import { MPM} from 'omp-lib/dist/interfaces/omp';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { FV_MPA_BID } from 'omp-lib/dist/format-validators/mpa_bid';

/**
 *
 */
export class BidValidator extends FV_MPA_BID implements ActionMessageValidatorInterface {

    public static isValid(msg: MarketplaceMessage): boolean {
        if (msg.action.type !== MPAction.MPA_BID) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_BID]);
        }

        // omp-lib doesnt support all the ActionMessageTypes which the marketplace supports, so msg needs to be cast to MPM
        return super.validate(msg as MPM);
    }
}
