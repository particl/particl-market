// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { EventEmitter } from 'events';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { BidService } from '../model/BidService';
import { BidFactory } from '../../factories/model/BidFactory';
import { SmsgService } from '../SmsgService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { OrderService } from '../model/OrderService';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { OrderStatus } from '../../enums/OrderStatus';
import { OrderItemService } from '../model/OrderItemService';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { BidCancelRequest } from '../../requests/action/BidCancelRequest';
import { BidCancelMessage } from '../../messages/action/BidCancelMessage';
import { BidCancelMessageFactory } from '../../factories/message/BidCancelMessageFactory';
import { BidCancelValidator } from '../../messagevalidators/BidCancelValidator';
import { BaseBidActionService } from '../BaseBidActionService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { NotifyService } from '../NotifyService';
import { ListingItemService } from '../model/ListingItemService';
import { ActionDirection } from '../../enums/ActionDirection';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { BlacklistService } from '../model/BlacklistService';

export class BidCancelActionService extends BaseBidActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.NotifyService) public notificationService: NotifyService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) public blacklistService: BlacklistService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidCancelMessageFactory) public actionMessageFactory: BidCancelMessageFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.BidCancelValidator) public validator: BidCancelValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_CANCEL,
            smsgService,
            smsgMessageService,
            notificationService,
            blacklistService,
            smsgMessageFactory,
            validator,
            Logger,
            listingItemService,
            bidService,
            bidFactory
        );
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * - generate BidCancelMessage
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: BidCancelRequest): Promise<MarketplaceMessage> {
        return await this.actionMessageFactory.get(actionRequest);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage, generated MPA_CANCEL
     */
    public async beforePost(actionRequest: BidCancelRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid (MPA_CANCEL) in the Database
     *   - the previous Bid should be added as parentBid to create the relation
     * - call createBid to create the Bid and update Order and OrderItem statuses
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(actionRequest: BidCancelRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        return smsgSendResponse;
    }

    /**
     * - create the Bid (MPA_CANCEL) (+BidDatas copied from parentBid), with previous Bid (MPA_BID) as the parentBid
     * - update OrderItem.status -> AWAITING_ESCROW
     * - update Order.status
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     * @param actionRequest
     */
    public async processMessage(marketplaceMessage: MarketplaceMessage,
                                actionDirection: ActionDirection,
                                smsgMessage: resources.SmsgMessage,
                                actionRequest?: BidCancelRequest): Promise<resources.SmsgMessage> {

        const bidCancelMessage: BidCancelMessage = marketplaceMessage.action as BidCancelMessage;
        const bidCreateRequest: BidCreateRequest = await this.createChildBidCreateRequest(bidCancelMessage, smsgMessage);

        await this.bidService.create(bidCreateRequest)
            .then(async value => {
                const bid: resources.Bid = value.toJSON();

                await this.orderItemService.updateStatus(bid.ParentBid.OrderItem.id, OrderItemStatus.BID_CANCELLED);
                await this.orderService.updateStatus(bid.ParentBid.OrderItem.Order.id, OrderStatus.CANCELED);

                await this.bidService.unlockBidOutputs(bid);

                return await this.bidService.findOne(bid.id, true).then(bidModel => bidModel.toJSON());
            });

        return smsgMessage;
    }

    /**
     *
     * @param marketplaceMessage
     * @param actionDirection
     * @param smsgMessage
     */
    public async createNotification(marketplaceMessage: MarketplaceMessage,
                                    actionDirection: ActionDirection,
                                    smsgMessage: resources.SmsgMessage): Promise<MarketplaceNotification | undefined> {

        // only send notifications when receiving messages
        if (ActionDirection.INCOMING === actionDirection) {
            return this.createBidNotification(marketplaceMessage, smsgMessage);
        }
        return undefined;
    }

}
