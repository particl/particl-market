// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ValidationException } from '../exceptions/ValidationException';
import { MPM} from 'omp-lib/dist/interfaces/omp';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { FV_MPA_LOCK } from 'omp-lib/dist/format-validators/mpa_lock';
import { decorate, inject, injectable, named } from 'inversify';
import { Targets, Types } from '../../constants';
import { BidService } from '../services/model/BidService';
import { EscrowLockMessage } from '../messages/action/EscrowLockMessage';
import { ActionDirection } from '../enums/ActionDirection';

decorate(injectable(), FV_MPA_LOCK);
export class EscrowLockValidator extends FV_MPA_LOCK implements ActionMessageValidatorInterface {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService
    ) {
        super();
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (message.action.type !== MPAction.MPA_LOCK) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPAction.MPA_LOCK]);
        }

        // omp-lib doesnt support all the ActionMessageTypes which the market supports, so msg needs to be cast to MPM
        return FV_MPA_LOCK.validate(message as MPM);
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        // MPA_ACCEPT should exists
        // -> (msg.action as MPA_LOCK).bid is the hash of MPA_BID
        // -> Bid of the type MPA_BID should have ChildBid of type MPA_ACCEPT
        return await this.bidService.findOneByHash((message.action as EscrowLockMessage).bid, true)
            .then( (value) => {
                const mpaBid: resources.Bid = value.toJSON();
                const childBid: resources.Bid | undefined = _.find(mpaBid.ChildBids, (child) => {
                    return child.type === MPAction.MPA_ACCEPT;
                });
                return !!childBid;
            })
            .catch( () => false);
    }

}
