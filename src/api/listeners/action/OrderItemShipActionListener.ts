// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Types, Core, Targets } from '../../../constants';
import { Logger as LoggerType } from '../../../core/Logger';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { SmsgMessageService } from '../../services/model/SmsgMessageService';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { BidCreateParams } from '../../factories/model/ModelCreateParams';
import { ListingItemService } from '../../services/model/ListingItemService';
import { ActionListenerInterface } from '../ActionListenerInterface';
import { BaseActionListenr } from '../BaseActionListenr';
import { BidFactory } from '../../factories/model/BidFactory';
import { BidService } from '../../services/model/BidService';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { OrderItemShipActionService } from '../../services/action/OrderItemShipActionService';
import { OrderItemShipMessage } from '../../messages/action/OrderItemShipMessage';
import { ProposalService } from '../../services/model/ProposalService';
import {OrderItemStatus} from '../../enums/OrderItemStatus';
import {OrderStatus} from '../../enums/OrderStatus';

export class OrderItemShipActionListener extends BaseActionListenr implements interfaces.Listener, ActionListenerInterface {

    public static Event = Symbol(MPActionExtended.MPA_SHIP);

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.action.OrderItemShipActionService) public orderItemShipActionService: OrderItemShipActionService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProposalService) public proposalService: ProposalService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        super(MPActionExtended.MPA_SHIP, smsgMessageService, bidService, proposalService, Logger);
    }

    /**
     * handles the received OrderItemShipMessage and return SmsgMessageStatus as a result
     *
     * TODO: check whether returned SmsgMessageStatuses actually make sense and the response to those
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: OrderItemShipMessage = marketplaceMessage.action as OrderItemShipMessage;

        // - first get the previous Bid (MPA_BID), fail if it doesn't exist
        // - then get the ListingItem the Bid is for, fail if it doesn't exist
        // - then, save the new Bid (MPA_SHIP)
        // - then, update the OrderItem.status and Order.status

        return await this.bidService.findOneByHash(actionMessage.bid)
            .then(async bidModel => {
                const parentBid: resources.Bid = bidModel.toJSON();

                // dont allow the MPA_SHIP to be processed before MPA_LOCK is received
                // MPA_LOCK sets OrderStatus.PROCESSING && OrderItemStatus.ESCROW_LOCKED
                if (parentBid.OrderItem.status === OrderItemStatus.ESCROW_LOCKED
                    && parentBid.OrderItem.Order.status === OrderStatus.PROCESSING) {

                    // escrow is locked
                    return await this.listingItemService.findOneByHash(parentBid.ListingItem.hash)
                        .then(async listingItemModel => {
                            const listingItem = listingItemModel.toJSON();

                            const bidCreateParams = {
                                msgid: smsgMessage.msgid,
                                listingItem,
                                bidder: smsgMessage.to,
                                parentBid
                            } as BidCreateParams;

                            return await this.bidFactory.get(bidCreateParams, actionMessage, smsgMessage)
                                .then(async orderItemShipRequest => {
                                    return await this.orderItemShipActionService.createBid(actionMessage, orderItemShipRequest)
                                        .then(value => {
                                            return SmsgMessageStatus.PROCESSED;
                                        })
                                        .catch(reason => {
                                            return SmsgMessageStatus.PROCESSING_FAILED;
                                        });
                                });
                        });
                } else {
                    // escrow is not locked yet, send to waiting queue, until escrow gets locked
                    return SmsgMessageStatus.WAITING;
                }

            })
            .catch(reason => {
                // could not find previous bid
                this.log.error('ERROR, reason: ', reason);
                return SmsgMessageStatus.PROCESSING_FAILED;
            });
    }


}
