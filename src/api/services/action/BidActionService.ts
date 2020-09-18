// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../../core/Logger';
import { Core, Targets, Types } from '../../../constants';
import { EventEmitter } from 'events';
import { BidService } from '../model/BidService';
import { BidFactory } from '../../factories/model/BidFactory';
import { SmsgService } from '../SmsgService';
import { ListingItemService } from '../model/ListingItemService';
import { SmsgSendResponse } from '../../responses/SmsgSendResponse';
import { MarketplaceMessage } from '../../messages/MarketplaceMessage';
import { OrderService } from '../model/OrderService';
import { SmsgMessageService } from '../model/SmsgMessageService';
import { BaseActionService } from '../BaseActionService';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { BidRequest } from '../../requests/action/BidRequest';
import { BidValidator } from '../../messagevalidators/BidValidator';
import { BidMessage } from '../../messages/action/BidMessage';
import { BidCreateParams, OrderCreateParams } from '../../factories/ModelCreateParams';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { OrderFactory } from '../../factories/model/OrderFactory';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { OrderCreateRequest } from '../../requests/model/OrderCreateRequest';
import { ActionDirection } from '../../enums/ActionDirection';
import { MPAction  } from 'omp-lib/dist/interfaces/omp-enums';
import { NotificationService } from '../NotificationService';
import { MessageException } from '../../exceptions/MessageException';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { BidNotification } from '../../messages/notification/BidNotification';
import { AddressCreateRequest } from '../../requests/model/AddressCreateRequest';
import { AddressType } from '../../enums/AddressType';
import { ProfileService } from '../model/ProfileService';
import { BidMessageFactory } from '../../factories/message/BidMessageFactory';
import { IdentityService } from '../model/IdentityService';


export class BidActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.model.IdentityService) public identityService: IdentityService,
        @inject(Types.Factory) @named(Targets.Factory.model.OrderFactory) public orderFactory: OrderFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.BidMessageFactory) public actionMessageFactory: BidMessageFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.BidValidator) public validator: BidValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_BID,
            smsgService,
            smsgMessageService,
            notificationService,
            smsgMessageFactory,
            validator,
            Logger
        );
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * - recreate ListingItemMessage with factory
     * - generate BidMessage with omp
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: BidRequest): Promise<MarketplaceMessage> {
        return await this.actionMessageFactory.get(actionRequest);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage
     */
    public async beforePost(actionRequest: BidRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid in the Database
     * - call createBid to create the Bid and other related models
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(actionRequest: BidRequest,
                           marketplaceMessage: MarketplaceMessage,
                           smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        return smsgSendResponse;
    }

    /**
     * - create the Bid (+BidDatas)
     * - use the Factory to create OrderCreateRequest for creating Order and OrderItems
     *   - also creates the hash, which should later be passed also to the seller
     * - create the Order with OrderItems
     *
     * @param marketplaceMessage, the message being posted or received
     * @param actionDirection, incoming/outgoing
     * @param smsgMessage, the inbox/outbox smsgMessage
     * @param actionRequest, contains the data to create the Bid, exists only when we are posting
     */
    public async processMessage(marketplaceMessage: MarketplaceMessage,
                                actionDirection: ActionDirection,
                                smsgMessage: resources.SmsgMessage,
                                actionRequest?: BidRequest): Promise<resources.SmsgMessage> {

        this.log.debug('processMessage(), actionDirection: ', actionDirection);

        // actionDirection === ActionDirection.OUTGOING -> buyer sending
        // actionDirection === ActionDirection.INCOMING -> seller receiving

        const bidderAddress = smsgMessage.from;
        const sellerAddress = smsgMessage.to;

        // first get the Market address on which the bid was made on
        const bidMessage: BidMessage = marketplaceMessage.action as BidMessage;
        const marketReceiveAddressKVS: KVS | undefined = _.find(bidMessage.objects || [], (kvs: KVS) => {
            return kvs.key === ActionMessageObjects.BID_ON_MARKET;
        });
        const marketReceiveAddress = marketReceiveAddressKVS!.value as string;
        // smsgMessage.to should be the same?

        // find the ListingItem the Bid is for
        const listingItem: resources.ListingItem = await this.listingItemService.findOneByHashAndMarketReceiveAddress(bidMessage.item,
            marketReceiveAddress).then(value => value.toJSON());
        const identity: resources.Identity = await this.identityService.findOneByAddress(
            actionDirection === ActionDirection.OUTGOING ? bidderAddress : sellerAddress).then(value => value.toJSON());

        this.log.debug('Processing a Bid for ListingItem: ', listingItem.id);
        this.log.debug('bidMessage: ', JSON.stringify(bidMessage, null, 2));

        let address: AddressCreateRequest;

        if (ActionDirection.INCOMING === actionDirection && _.isEmpty(listingItem.ListingItemTemplate)) {
            // incoming message -> we are the seller, there should be a ListingItemTemplate
            throw new MessageException('Received a Bid for a ListingItem which has no relation to ListingItemTemplate.');

        } else if (ActionDirection.INCOMING === actionDirection) {
            // incoming message -> we are the seller, there should be a ListingItemTemplate

            // add profile_id and type to the ShippingAddress to make it an AddressCreateRequest
            address = bidMessage.buyer.shippingAddress as AddressCreateRequest;
            address.profile_id = listingItem.ListingItemTemplate.Profile.id;
            address.type = AddressType.SHIPPING_BID;

        } else { // (ActionDirection.OUTGOING === actionDirection) {
            // outgoing message -> we are the bidder, there is no ListingItemTemplate
            address = actionRequest!.address;
        }

        const bidCreateRequest: BidCreateRequest = await this.bidFactory.get({
            actionMessage: marketplaceMessage.action as BidMessage,
            smsgMessage,
            identity,
            bidder: smsgMessage.from,
            listingItem,
            address
            // parentBid: undefined
        } as BidCreateParams);

        // TODO: currently we support just one OrderItem per Order

        const bid: resources.Bid = await this.bidService.create(bidCreateRequest).then(value => value.toJSON());

        if (bid.bidder !== smsgMessage.from || bid.ListingItem.seller !== smsgMessage.to) {
            // bid.bidder should be the address which sent the MPA_BID
            // bid.ListingItem.seller should be the address the MPA_BID was sent to
            this.log.debug('createBid(), bid.bidder: ', bid.bidder);
            this.log.debug('createBid(), smsgMessage.from: ', smsgMessage.from);
            this.log.debug('createBid(), bid.ListingItem.seller: ', bid.ListingItem.seller);
            this.log.debug('createBid(), smsgMessage.to: ', smsgMessage.to);
            throw new MessageException('Something funny going on with the seller/buyer addresses.');
        }

        // if we're the buyer, Order hash was generated before posting the BidMessage to the seller
        // if we're the seller, we should have received the Order hash from the buyer in the message
        const orderHash = _.find(bidMessage.objects || [], (kvs: KVS) => {
            return kvs.key === ActionMessageObjects.ORDER_HASH;
        });
        this.log.debug('createBid(), orderHash: ', orderHash);

        const orderCreateRequest: OrderCreateRequest = await this.orderFactory.get({
                actionMessage: marketplaceMessage.action as BidMessage,
                smsgMessage,
                bids: [bid],
                hash: orderHash!.value
            } as OrderCreateParams);

        await this.orderService.create(orderCreateRequest).then(value => value.toJSON());

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

            const bid: resources.Bid = await this.bidService.findOneByMsgId(smsgMessage.msgid)
                .then(value => value.toJSON())
                .catch(err => undefined);

            if (bid) {
                const notification: MarketplaceNotification = {
                    event: MPAction.MPA_BID,
                    payload: {
                        id: bid.id,
                        hash: bid.hash,
                        bidder: bid.bidder,
                        listingItemHash: bid.ListingItem.hash,
                        market: bid.ListingItem.market
                    } as BidNotification
                };
                return notification;
            }
        }
        return undefined;
    }
}
