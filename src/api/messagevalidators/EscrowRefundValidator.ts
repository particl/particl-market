// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { ValidationException } from '../exceptions/ValidationException';
import { ActionMessageValidatorInterface } from './ActionMessageValidatorInterface';
import { MPActionExtended } from '../enums/MPActionExtended';
import { MessageException } from '../exceptions/MessageException';
import { inject, named } from 'inversify';
import { Targets, Types } from '../../constants';
import { BidService } from '../services/model/BidService';
import { EscrowRefundMessage } from '../messages/action/EscrowRefundMessage';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ActionDirection } from '../enums/ActionDirection';

export class EscrowRefundValidator implements ActionMessageValidatorInterface {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService
    ) {
    }

    public async validateMessage(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        if (!message.version) {
            throw new MessageException('version: missing');
        }

        if (!message.action) {
            throw new MessageException('action: missing');
        }

        if (!message.action.type) {
            throw new MessageException('action.type: missing');
        }

        if (message.action.type !== MPActionExtended.MPA_REFUND) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPActionExtended.MPA_REFUND]);
        }
        return true;
    }

    public async validateSequence(message: MarketplaceMessage, direction: ActionDirection): Promise<boolean> {
        // MPA_LOCK should exists
        // -> (msg.action as MPA_REFUND).bid is the hash of MPA_BID and should be found
        // -> Bid of the type MPA_BID should have ChildBid of type MPA_LOCK
        return await this.bidService.findOneByHash((message.action as EscrowRefundMessage).bid, true)
            .then( (value) => {
                const mpaBid: resources.Bid = value.toJSON();
                const childBid: resources.Bid | undefined = _.find(mpaBid.ChildBids, (child) => {
                    return child.type === MPAction.MPA_LOCK;
                });
                return !!childBid;
            })
            .catch( () => false);
    }

}
