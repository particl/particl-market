// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { ompVersion } from 'omp-lib';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { EventEmitter } from 'events';
import { BidService } from '../model/BidService';
import { BidFactory } from '../../factories/model/BidFactory';
import { SmsgService } from '../SmsgService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { OrderService } from '../model/OrderService';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { BaseActionService } from './BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { BidCreateParams } from '../../factories/model/ModelCreateParams';
import { OrderStatus } from '../../enums/OrderStatus';
import { OrderItemService } from '../model/OrderItemService';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { OrderItemShipRequest } from '../../requests/action/OrderItemShipRequest';
import { OrderItemShipValidator } from '../../messages/validator/OrderItemShipValidator';
import { OrderItemShipMessage } from '../../messages/action/OrderItemShipMessage';
import { OrderItemShipMessageFactory } from '../../factories/message/OrderItemShipMessageFactory';
import { OrderItemShipMessageCreateParams } from '../../requests/message/OrderItemShipMessageCreateParams';

export class OrderItemShipActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,

        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.OrderItemShipMessageFactory) public orderItemShipMessageFactory: OrderItemShipMessageFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(smsgService, smsgMessageService, smsgMessageFactory);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * @param params
     */
    public async createMessage(params: OrderItemShipRequest): Promise<MarketplaceMessage> {

        // bidMessage is stored when received and so its msgid is stored with the bid, so we can just fetch it using the msgid
        return this.smsgMessageService.findOneByMsgId(params.bid.msgid)
            .then(async bid => {

                const actionMessage: OrderItemShipMessage = await this.orderItemShipMessageFactory.get({
                    bidHash: params.bid.hash,
                    memo: params.memo
                } as OrderItemShipMessageCreateParams);

                this.log.debug('actionMessage: ', JSON.stringify(actionMessage, null, 2));

                return {
                    version: ompVersion(),
                    action: actionMessage
                } as MarketplaceMessage;

            });

    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network.
     * called directly after createMessage to validate the creation.
     *
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        // todo: implement a Base/CommonMessageValidator for validating the common stuff
        return OrderItemShipValidator.isValid(marketplaceMessage);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage, MPA_COMPLETE
     */
    public async beforePost(params: OrderItemShipRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        // msgid is not set here, its updated in the afterPost
        const bidCreateParams = {
            listingItem: params.bid.ListingItem,
            bidder: params.bid.bidder,
            parentBid: params.bid
        } as BidCreateParams;

        return await this.bidFactory.get(bidCreateParams, marketplaceMessage.action as OrderItemShipMessage)
            .then(async bidCreateRequest => {
                return await this.createBid(marketplaceMessage.action as OrderItemShipMessage, bidCreateRequest)
                    .then(async value => {
                        params.createdBid = value;
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
    public async afterPost(params: OrderItemShipRequest, marketplaceMessage: MarketplaceMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        // todo: stupid fix for possible undefined which shouldnt even happen, fix the real cause
        smsgSendResponse.msgid =  smsgSendResponse.msgid ? smsgSendResponse.msgid : '';
        await this.bidService.updateMsgId(params.createdBid.id, smsgSendResponse.msgid);
        return smsgSendResponse;
    }

    /**
     * - create the Bid (MPA_SHIP), with previous Bid (MPA_BID) as the parentBid
     * - update OrderItem.status
     * - update Order.status
     *
     * @param orderItemShipMessage
     * @param bidCreateRequest
     */
    public async createBid(orderItemShipMessage: OrderItemShipMessage, bidCreateRequest: BidCreateRequest): Promise<resources.Bid> {

        // TODO: currently we support just one OrderItem per Order
        return await this.bidService.create(bidCreateRequest)
            .then(async value => {
                const bid: resources.Bid = value.toJSON();

                // this.log.debug('createBid(), bid: ', JSON.stringify(bid, null, 2));

                await this.orderItemService.updateStatus(bid.ParentBid.OrderItem.id, OrderItemStatus.SHIPPING);
                await this.orderService.updateStatus(bid.ParentBid.OrderItem.Order.id, OrderStatus.SHIPPING);

                return await this.bidService.findOne(bid.id, true).then(bidModel => bidModel.toJSON());
            });
    }
}
