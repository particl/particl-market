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
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { ListingItemAddActionService } from './ListingItemAddActionService';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { OmpService } from '../OmpService';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { BidCreateParams } from '../../factories/model/ModelCreateParams';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { BidAcceptRequest } from '../../requests/action/BidAcceptRequest';
import { BidAcceptValidator } from '../../messages/validator/BidAcceptValidator';
import { BidAcceptMessage } from '../../messages/action/BidAcceptMessage';
import { OrderStatus } from '../../enums/OrderStatus';
import { BidMessage } from '../../messages/action/BidMessage';
import { OrderItemService } from '../model/OrderItemService';
import { OrderItemStatus } from '../../enums/OrderItemStatus';

export class BidAcceptActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,

        @inject(Types.Service) @named(Targets.Service.OmpService) public ompService: OmpService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(smsgService, smsgMessageService, smsgMessageFactory);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * - recreate ListingItemMessage with factory
     * - find the received BidMessage
     * - generate BidAcceptMessage with omp using recreated ListingItemMessage and previously stored BidMessage
     *
     * @param params
     */
    public async createMessage(params: BidAcceptRequest): Promise<MarketplaceMessage> {

        // note: factory checks that the hashes match
        return await this.listingItemAddActionService.createMessage({
            sendParams: {} as SmsgSendParams, // not needed, this message is not sent
            listingItem: params.bid.ListingItem
        } as ListingItemAddRequest)
            .then(async listingItemAddMPM => {

                this.log.debug('createMessage(), listingItemAddMPM:', JSON.stringify(listingItemAddMPM, null, 2));

                // bidMessage is stored when received and so its msgid is stored with the bid, so we can just fetch it using the msgid
                return this.smsgMessageService.findOneByMsgId(params.bid.msgid)
                    .then(async value => {

                        const bidSmsgMessage: resources.SmsgMessage = value.toJSON();
                        const bidMPM: MarketplaceMessage = JSON.parse(bidSmsgMessage.text);

                        // finally use omp to generate BidAcceptMessage
                        return await this.ompService.accept(
                            listingItemAddMPM.action as ListingItemAddMessage,
                            bidMPM.action as BidMessage
                        );
                    });
            });
    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network.
     * called directly after createMessage to validate the creation.
     *
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        return BidAcceptValidator.isValid(marketplaceMessage);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid (MPA_ACCEPT) in the Database
     *   - the previous Bid should be added as parentBid to create the relation
     * - call createBid to create the Bid and update Order and OrderItem statuses
     *
     * @param params
     * @param marketplaceMessage, omp generated MPA_ACCEPT
     */
    public async beforePost(params: BidAcceptRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        // msgid is not set here, its updated in the afterPost
        const bidCreateParams = {
            listingItem: params.bid.ListingItem,
            bidder: params.bid.bidder,
            parentBid: params.bid
        } as BidCreateParams;

        return await this.bidFactory.get(bidCreateParams, marketplaceMessage.action as BidAcceptMessage)
            .then(async bidCreateRequest => {
                // this.log.debug('bidCreateRequest: ', JSON.stringify(bidCreateRequest, null, 2));
                return await this.createBid(marketplaceMessage.action as BidAcceptMessage, bidCreateRequest)
                    .then(value => {
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
    public async afterPost(params: BidAcceptRequest, marketplaceMessage: MarketplaceMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        // todo: stupid fix for possible undefined which shouldnt even happen, fix the real cause
        smsgSendResponse.msgid =  smsgSendResponse.msgid ? smsgSendResponse.msgid : '';
        await this.bidService.updateMsgId(params.createdBid.id, smsgSendResponse.msgid);
        return smsgSendResponse;
    }

    /**
     * - create the Bid (MPA_ACCEPT) (+BidDatas copied from parentBid), with previous Bid (MPA_BID) as the parentBid
     * - update OrderItem.status -> AWAITING_ESCROW
     * - update Order.status
     *
     * @param bidAcceptMessage
     * @param bidCreateRequest
     */
    public async createBid(bidAcceptMessage: BidAcceptMessage, bidCreateRequest: BidCreateRequest): Promise<resources.Bid> {

        // TODO: currently we support just one OrderItem per Order
        return await this.bidService.create(bidCreateRequest)
            .then(async value => {
                let bid: resources.Bid = value.toJSON();
                bid = await this.bidService.findOne(bid.id, true).then(bidModel => bidModel.toJSON());
                this.log.debug('bid: ', JSON.stringify(bid, null, 2));

                this.log.debug('bid.ParentBid.OrderItem.id: ', bid.ParentBid.OrderItem.id);
                this.log.debug('bid.ParentBid.OrderItem.Order.id: ', bid.ParentBid.OrderItem.Order.id);
                this.log.debug('bid.id: ', bid.id);
                await this.orderItemService.updateStatus(bid.ParentBid.OrderItem.id, OrderItemStatus.AWAITING_ESCROW);
                await this.orderService.updateStatus(bid.ParentBid.OrderItem.Order.id, OrderStatus.PROCESSING);

                return await this.bidService.findOne(bid.id, true).then(bidModel => bidModel.toJSON());
            });
    }
}
