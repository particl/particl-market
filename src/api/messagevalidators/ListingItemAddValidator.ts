// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { FV_MPA_LISTING } from 'omp-lib/dist/format-validators/mpa_listing_add';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { MPM } from 'omp-lib/dist/interfaces/omp';
import { decorate, injectable } from 'inversify';
import { ActionDirection } from '../enums/ActionDirection';

/**
 *
 */
decorate(injectable(), FV_MPA_LISTING);
export class ListingItemAddValidator extends FV_MPA_LISTING implements ActionMessageValidatorInterface {

    constructor() {
        super();
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (message.action.type !== MPAction.MPA_LISTING_ADD) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_LISTING_ADD]);
        }

        // omp-lib doesnt support all the ActionMessageTypes which the market supports, so msg needs to be cast to MPM
        return FV_MPA_LISTING.validate(message as MPM);
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        return true;
    }

}
