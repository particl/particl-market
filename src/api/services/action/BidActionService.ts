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
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { ListingItemAddActionService } from './ListingItemAddActionService';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { OmpService } from '../OmpService';
import { BidConfiguration } from 'omp-lib/dist/interfaces/configs';
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { BidValidator } from '../../messagevalidators/BidValidator';
import { BidMessage } from '../../messages/action/BidMessage';
import { BidCreateParams, OrderCreateParams } from '../../factories/model/ModelCreateParams';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { ShippingAddress } from 'omp-lib/dist/interfaces/omp';
import { OrderFactory } from '../../factories/model/OrderFactory';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { OrderCreateRequest } from '../../requests/model/OrderCreateRequest';
import { ConfigurableHasher } from 'omp-lib/dist/hasher/hash';
import { HashableOrderCreateRequestConfig } from '../../factories/hashableconfig/createrequest/HashableOrderCreateRequestConfig';
import { ActionDirection } from '../../enums/ActionDirection';
import { OrderStatus } from '../../enums/OrderStatus';
import { MPAction  } from 'omp-lib/dist/interfaces/omp-enums';
import { NotificationService } from '../NotificationService';
import { MessageException } from '../../exceptions/MessageException';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { BidNotification } from '../../messages/notification/BidNotification';
import { AddressCreateRequest } from '../../requests/model/AddressCreateRequest';
import { AddressType } from '../../enums/AddressType';
import { ProfileService } from '../model/ProfileService';
import {ActionMessageTypes} from '../../enums/ActionMessageTypes';

export class BidActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.OmpService) public ompService: OmpService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Factory) @named(Targets.Factory.model.OrderFactory) public orderFactory: OrderFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
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

        // note: factory checks that the hashes match
        const listingItemAddMPM: MarketplaceMessage = await this.listingItemAddActionService.createMarketplaceMessage({
            sendParams: {} as SmsgSendParams, // not needed, this message is not sent
            listingItem: actionRequest.listingItem,
            sellerAddress: actionRequest.listingItem.seller
        } as ListingItemAddRequest);

        // this.log.debug('createMessage(), listingItemAddMPM: ', JSON.stringify(listingItemAddMPM, null, 2));

        // create a hash for the Order so it can be sent to the seller
        const orderHash = ConfigurableHasher.hash({
            buyer: actionRequest.sendParams.fromAddress,
            seller: actionRequest.listingItem.seller,
            generatedAt: +Date.now()
        } as OrderCreateRequest, new HashableOrderCreateRequestConfig());

        // Add the Market which the ListingItem is being bidded on
        const objects: KVS[] = [];
        objects.push({
            key: ActionMessageObjects.BID_ON_MARKET,
            value: actionRequest.market.receiveAddress
        } as KVS);

        // add the created orderHash to the objects to be sent to the seller
        objects.push({
            key: ActionMessageObjects.ORDER_HASH,
            value: orderHash
        } as KVS);

        // todo: add product variations etc bid related actionRequest

        const config: BidConfiguration = {
            cryptocurrency: Cryptocurrency.PART,
            escrow: actionRequest.listingItem.PaymentInformation.Escrow.type,
            shippingAddress: actionRequest.address as ShippingAddress,
            objects
        };

        // use omp to generate BidMessage
        return await this.ompService.bid(actionRequest.sendParams.wallet, config, listingItemAddMPM.action as ListingItemAddMessage);
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

        const bidMessage: BidMessage = marketplaceMessage.action as BidMessage;

        // first get the Market address on which the bid was made on
        const marketReceiveAddressKVS: KVS | undefined = _.find(bidMessage.objects || [], (kvs: KVS) => {
            return kvs.key === ActionMessageObjects.BID_ON_MARKET;
        });
        const marketReceiveAddress = marketReceiveAddressKVS!.value as string;
        // smsgMessage.to should be the same?

        // then
        const listingItem: resources.ListingItem = await this.listingItemService.findOneByHashAndMarketReceiveAddress(bidMessage.item,
            marketReceiveAddress).then(value => value.toJSON());

        this.log.debug('Processing a Bid for listingItem: ', JSON.stringify(listingItem, null, 2));
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

            // actionRequest exists and should contain AddressCreateRequest
            address = actionRequest!.address;
        }

        const profile: resources.Profile = await this.profileService.findOne(address.profile_id).then(value => value.toJSON());

        const bidCreateRequest: BidCreateRequest = await this.bidFactory.get({
                profile,
                listingItem,
                address,
                bidder: smsgMessage.from
                // parentBid: undefined
            } as BidCreateParams,
            marketplaceMessage.action as BidMessage,
            smsgMessage);

        // TODO: currently we support just one OrderItem per Order

        const bid: resources.Bid = await this.bidService.create(bidCreateRequest).then(value => value.toJSON());
        this.log.debug('createBid(), bid: ', JSON.stringify(bid, null, 2));

        // if we're the buyer, Order hash was generated before posting the BidMessage to the seller
        // if we're the seller, we should have received the Order hash from the buyer in the message
        const orderHash = _.find(bidMessage.objects || [], (kvs: KVS) => {
            return kvs.key === ActionMessageObjects.ORDER_HASH;
        });
        this.log.debug('createBid(), orderHash: ', orderHash);

        const orderCreateRequest: OrderCreateRequest = await this.orderFactory.get({
                bids: [bid],
                addressId: bid.ShippingAddress.id,
                buyer: bid.bidder,                      // smsgMessage.from
                seller: bid.ListingItem.seller,         // smsgMessage.to
                status: smsgMessage.direction === ActionDirection.INCOMING ? OrderStatus.RECEIVED : OrderStatus.SENT,
                generatedAt: bid.generatedAt,
                hash: orderHash!.value
            } as OrderCreateParams);

        if (bid.bidder !== smsgMessage.from || bid.ListingItem.seller !== smsgMessage.to) {
            throw new MessageException('Something funny going on with the seller/buyer addresses.');
        }

        // this.log.debug('createBid(), orderCreateRequest: ', JSON.stringify(orderCreateRequest, null, 2));

        const order: resources.Order = await this.orderService.create(orderCreateRequest).then(value => value.toJSON());
        this.log.debug('createBid(), created Order: ', JSON.stringify(order, null, 2));

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
