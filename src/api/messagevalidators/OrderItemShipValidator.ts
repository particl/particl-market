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
import { OrderItemShipMessage } from '../messages/action/OrderItemShipMessage';
import { OrderItemStatus } from '../enums/OrderItemStatus';

/**
 *
 */
export class OrderItemShipValidator implements ActionMessageValidatorInterface {

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

        if (message.action.type !== MPActionExtended.MPA_SHIP) {
            throw new ValidationException('Invalid action type.', ['Accepting only ' + MPActionExtended.MPA_SHIP]);
        }
        return true;
    }

    public async validateSequence(message: MarketplaceMessage): Promise<boolean> {
        // MPA_COMPLETE should exists
        // -> orderItem should have status OrderItemStatus.ESCROW_COMPLETED, meaning there's no race condition
        // -> (msg.action as MPA_SHIP).bid is the hash of MPA_BID and should be found
        // -> Bid of the type MPA_BID should have ChildBid of type MPA_COMPLETE
        return await this.bidService.findOneByHash((message.action as OrderItemShipMessage).bid, true)
            .then( (value) => {
                const mpaBid: resources.Bid = value.toJSON();
                if (mpaBid.OrderItem.status !== OrderItemStatus.ESCROW_COMPLETED) {
                    return false;
                }
                const childBid: resources.Bid | undefined = _.find(mpaBid.ChildBids, (child) => {
                    return child.type === MPActionExtended.MPA_COMPLETE;
                });
                return !!childBid;
            })
            .catch( () => false);
    }
}
