// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ValidationException } from '../exceptions/ValidationException';
import { MPM } from 'omp-lib/dist/interfaces/omp';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { FV_MPA_CANCEL } from 'omp-lib/dist/format-validators/mpa_cancel';
import { decorate, inject, injectable, named } from 'inversify';
import { Targets, Types } from '../../constants';
import { BidService } from '../services/model/BidService';
import { BidCancelMessage } from '../messages/action/BidCancelMessage';
import { ActionDirection } from '../enums/ActionDirection';

/**
 *
 */
decorate(injectable(), FV_MPA_CANCEL);
export class BidCancelValidator extends FV_MPA_CANCEL implements ActionMessageValidatorInterface {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService
    ) {
        super();
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (message.action.type !== MPAction.MPA_CANCEL) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_CANCEL]);
        }

        // omp-lib doesnt support all the ActionMessageTypes which the market supports, so msg needs to be cast to MPM
        return FV_MPA_CANCEL.validate(message as MPM);
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        // MPA_BID should exists
        // -> (msg.action as MPA_CANCEL).bid is the hash of MPA_BID
        return await this.bidService.findOneByHash((message.action as BidCancelMessage).bid, true)
            .then( () => true)
            .catch( () => false);
    }

}
