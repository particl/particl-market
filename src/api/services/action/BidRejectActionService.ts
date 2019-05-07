// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { ompVersion } from 'omp-lib';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { MarketplaceMessageEvent } from '../../messages/MarketplaceMessageEvent';
import { EventEmitter } from 'events';
import { BidService } from '../model/BidService';
import { BidFactory } from '../../factories/model/BidFactory';
import { SmsgService } from '../SmsgService';
import { ListingItemService } from '../model/ListingItemService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { OrderService } from '../model/OrderService';
import { SmsgMessageStatus } from '../../enums/SmsgMessageStatus';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BaseActionService } from './BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { BidCreateParams } from '../../factories/model/ModelCreateParams';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { OrderStatus } from '../../enums/OrderStatus';
import { OrderItemService } from '../model/OrderItemService';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { BidRejectMessage } from '../../messages/action/BidRejectMessage';
import { BidRejectMessageFactory } from '../../factories/message/BidRejectMessageFactory';
import { BidRejectMessageCreateParams } from '../../requests/message/BidRejectMessageCreateParams';
import { BidRejectValidator } from '../../messages/validator/BidRejectValidator';
import { BidRejectRequest } from '../../requests/action/BidRejectRequest';

export class BidRejectActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,

        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidRejectMessageFactory) public bidRejectMessageFactory: BidRejectMessageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_REJECT, smsgService, smsgMessageService, smsgMessageFactory, eventEmitter, Logger);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * - generate BidRejectMessage
     *
     * @param params
     */
    public async createMessage(params: BidRejectRequest): Promise<MarketplaceMessage> {

        const actionMessage: BidRejectMessage = await this.bidRejectMessageFactory.get({
            bidHash: params.bid.hash
        } as BidRejectMessageCreateParams);

        return {
            version: ompVersion(),
            action: actionMessage
        } as MarketplaceMessage;

    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network.
     * called directly after createMessage to validate the creation.
     *
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        return BidRejectValidator.isValid(marketplaceMessage);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid (MPA_REJECT) in the Database
     *   - the previous Bid should be added as parentBid to create the relation
     * - call createBid to create the Bid and update Order and OrderItem statuses
     *
     * @param params
     * @param marketplaceMessage, generated MPA_REJECT
     */
    public async beforePost(params: BidRejectRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        const bidCreateParams = {
            listingItem: params.bid.ListingItem,
            bidder: params.bid.bidder,
            parentBid: params.bid
        } as BidCreateParams;

        return await this.bidFactory.get(bidCreateParams, marketplaceMessage.action as BidRejectMessage)
            .then(async bidCreateRequest => {
                return await this.createBid(marketplaceMessage.action as BidRejectMessage, bidCreateRequest)
                    .then(value => {
                        return marketplaceMessage;
                    });
            });
    }

    /**
     * called after post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage
     * @param smsgSendResponse
     */
    public async afterPost(params: BidRejectRequest, marketplaceMessage: MarketplaceMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        return smsgSendResponse;
    }

    /**
     * handles the received BidRejectMessage and return SmsgMessageStatus as a result
     *
     * TODO: check whether returned SmsgMessageStatuses actually make sense and the response to those
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: BidRejectMessage = marketplaceMessage.action as BidRejectMessage;

        // - first get the previous Bid (MPA_BID), fail if it doesn't exist
        // - then get the ListingItem the Bid is for, fail if it doesn't exist
        // - then, save the new Bid (MPA_REJECT)
        // - then, update the OrderItem.status and Order.status

        return await this.bidService.findOneByHash(actionMessage.bid)
            .then(async bidModel => {
                const parentBid: resources.Bid = bidModel.toJSON();
                return await this.listingItemService.findOneByHash(parentBid.ListingItem.hash)
                    .then(async listingItemModel => {
                        const listingItem = listingItemModel.toJSON();

                        const bidCreateParams = {
                            listingItem,
                            bidder: smsgMessage.to,
                            parentBid
                        } as BidCreateParams;

                        return await this.bidFactory.get(bidCreateParams, marketplaceMessage.action as BidRejectMessage)
                            .then(async bidCreateRequest => {
                                return await this.createBid(marketplaceMessage.action as BidRejectMessage, bidCreateRequest)
                                    .then(value => {
                                        return SmsgMessageStatus.PROCESSED;
                                    })
                                    .catch(reason => {
                                        return SmsgMessageStatus.PROCESSING_FAILED;
                                    });
                            });

                    });


            })
            .catch(reason => {
                // could not find previous bid
                this.log.error('ERROR, reason: ', reason);
                return SmsgMessageStatus.PROCESSING_FAILED;
            });


    }

    /**
     * - create the Bid (MPA_REJECT) (+BidDatas copied from parentBid), with previous Bid (MPA_BID) as the parentBid
     * - update OrderItem.status -> AWAITING_ESCROW
     * - update Order.status
     *
     * @param bidRejectMessage
     * @param bidCreateRequest
     */
    private async createBid(bidRejectMessage: BidRejectMessage, bidCreateRequest: BidCreateRequest): Promise<resources.Bid> {

        // TODO: currently we support just one OrderItem per Order
        return await this.bidService.create(bidCreateRequest)
            .then(async value => {
                const bid: resources.Bid = value.toJSON();

                await this.orderItemService.updateStatus(bid.ParentBid.OrderItem.id, OrderItemStatus.BID_REJECTED);
                await this.orderService.updateStatus(bid.ParentBid.OrderItem.Order.id, OrderStatus.REJECTED);

                return await this.bidService.findOne(bid.id, true).then(bidModel => bidModel.toJSON());
            });
    }
}
