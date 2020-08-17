// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ValidationException } from '../exceptions/ValidationException';
import { MPM} from 'omp-lib/dist/interfaces/omp';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { FV_MPA_ACCEPT } from 'omp-lib/dist/format-validators/mpa_accept';
import { decorate, inject, injectable, named } from 'inversify';
import { BidAcceptMessage } from '../messages/action/BidAcceptMessage';
import { Targets, Types  } from '../../constants';
import { BidService } from '../services/model/BidService';
import { ActionDirection } from '../enums/ActionDirection';

decorate(injectable(), FV_MPA_ACCEPT);
export class BidAcceptValidator extends FV_MPA_ACCEPT implements ActionMessageValidatorInterface {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService
    ) {
        super();
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (message.action.type !== MPAction.MPA_ACCEPT) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_ACCEPT]);
        }

        // omp-lib doesnt support all the ActionMessageTypes which the market supports, so msg needs to be cast to MPM
        return FV_MPA_ACCEPT.validate(message as MPM);
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        // MPA_BID should exists
        // -> (msg.action as MPA_ACCEPT).bid is the hash of MPA_BID
        return await this.bidService.findOneByHash((message.action as BidAcceptMessage).bid, true)
            .then( () => true)
            .catch( () => false);
    }
}
