// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { FV_MPA_LISTING } from 'omp-lib/dist/format-validators/mpa_listing_add';
import { MarketplaceMessage } from '../MarketplaceMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ValidationException } from '../../exceptions/ValidationException';
import { MPM } from 'omp-lib/dist/interfaces/omp';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';

/**
 *
 */
export class ListingItemAddValidator extends FV_MPA_LISTING implements ActionMessageValidatorInterface {

    public static isValid(msg: MarketplaceMessage): boolean {
        if (msg.action.type !== MPAction.MPA_LISTING_ADD) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_LISTING_ADD]);
        }

        // omp-lib doesnt support all the ActionMessageTypes which the market supports, so msg needs to be cast to MPM
        return super.validate(msg as MPM);
    }
}
