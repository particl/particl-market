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
import { EscrowReleaseMessage } from '../messages/action/EscrowReleaseMessage';

/**
 *
 */
export class EscrowReleaseValidator implements ActionMessageValidatorInterface {

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService
    ) {
    }

    public async validateMessage(message: MarketplaceMessage): Promise<boolean> {
        if (!message.version) {
            throw new MessageException('version: missing');
        }

        if (!message.action) {
            throw new MessageException('action: missing');
        }

        if (!message.action.type) {
            throw new MessageException('action.type: missing');
        }

        if (message.action.type !== MPActionExtended.MPA_RELEASE) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPActionExtended.MPA_RELEASE]);
        }
        return true;
    }

    public async validateSequence(message: MarketplaceMessage): Promise<boolean> {
        // both MPA_COMPLETE and MPA_SHIP should exists
        // -> (msg.action as MPA_RELEASE).bid is the hash of MPA_BID and should be found
        // -> Bid of the type MPA_BID should have ChildBid of type MPA_LOCK
        return await this.bidService.findOneByHash((message.action as EscrowReleaseMessage).bid, true)
            .then( (value) => {
                const mpaBid: resources.Bid = value.toJSON();
                const completeBid: resources.Bid | undefined = _.find(mpaBid.ChildBids, (child) => {
                    return child.type === MPActionExtended.MPA_COMPLETE;
                });
                const shipBid: resources.Bid | undefined = _.find(mpaBid.ChildBids, (child) => {
                    return child.type === MPActionExtended.MPA_SHIP;
                });

                return completeBid !== undefined && shipBid !== undefined;
            })
            .catch( () => false);
    }
}
