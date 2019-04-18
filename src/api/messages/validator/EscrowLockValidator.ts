// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../MarketplaceMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ValidationException } from '../../exceptions/ValidationException';
import { MPM} from 'omp-lib/dist/interfaces/omp';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { FV_MPA_REJECT } from 'omp-lib/dist/format-validators/mpa_reject';
import {FV_MPA_LOCK} from 'omp-lib/dist/format-validators/mpa_lock';

/**
 *
 */
export class EscrowLockValidator extends FV_MPA_LOCK implements ActionMessageValidatorInterface {

    public static isValid(msg: MarketplaceMessage): boolean {
        if (msg.action.type !== MPAction.MPA_LOCK) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_LOCK]);
        }

        // omp-lib doesnt support all the ActionMessageTypes which the marketplace supports, so msg needs to be cast to MPM
        return super.validate(msg as MPM);
    }
}
