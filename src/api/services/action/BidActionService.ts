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
import { BidRequest } from '../../requests/action/BidRequest';
import { ListingItemAddRequest } from '../../requests/action/ListingItemAddRequest';
import { ListingItemAddActionService } from './ListingItemAddActionService';
import { SmsgSendParams } from '../../requests/action/SmsgSendParams';
import { OmpService } from '../OmpService';
import { BidConfiguration } from 'omp-lib/dist/interfaces/configs';
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ListingItemAddMessage } from '../../messages/action/ListingItemAddMessage';
import { BidValidator } from '../../messages/validator/BidValidator';
import { BidMessage } from '../../messages/action/BidMessage';
import { BidCreateParams, OrderCreateParams } from '../../factories/model/ModelCreateParams';
import { MessageException } from '../../exceptions/MessageException';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { AddressType } from '../../enums/AddressType';
import { ShippingAddress } from 'omp-lib/dist/interfaces/omp';
import { AddressCreateRequest } from '../../requests/model/AddressCreateRequest';
import { OrderFactory } from '../../factories/model/OrderFactory';
import { OrderStatus } from '../../enums/OrderStatus';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';


export class BidActionService extends BaseActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,

        @inject(Types.Service) @named(Targets.Service.OmpService) public ompService: OmpService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Factory) @named(Targets.Factory.model.OrderFactory) public orderFactory: OrderFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_BID, smsgService, smsgMessageService, smsgMessageFactory, eventEmitter);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * - recreate ListingItemMessage with factory
     * - generate BidMessage with omp
     *
     * @param params
     */
    public async createMessage(params: BidRequest): Promise<MarketplaceMessage> {

        // note: factory checks that the hashes match
        const listingItemAddMPM: MarketplaceMessage = await this.listingItemAddActionService.createMessage({
            sendParams: {} as SmsgSendParams, // not needed, this message is not sent
            listingItem: params.listingItem
        } as ListingItemAddRequest);

        const config: BidConfiguration = {
            cryptocurrency: Cryptocurrency.PART,    // todo: hardcoded PART for now
            escrow: params.listingItem.PaymentInformation.Escrow.type,
            shippingAddress: params.address as ShippingAddress
            // objects: KVS[] // product variations etc bid related params
        };

        // use omp to generate BidMessage
        return await this.ompService.bid(config, listingItemAddMPM.action as ListingItemAddMessage);
    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network.
     * called directly after createMessage to validate the creation.
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        return BidValidator.isValid(marketplaceMessage);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid in the Database
     * - call createBid to create the Bid and other related models
     *
     * @param params
     * @param marketplaceMessage
     */
    public async beforePost(params: BidRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        const bidCreateParams = {
            listingItem: params.listingItem,
            address: params.address,
            bidder: params.sendParams.fromAddress
            // parentBid: undefined
        } as BidCreateParams;

        // TODO: should we set the parentBid in the case the previous Bid was cancelled or rejected?

        return await this.bidFactory.get(bidCreateParams, marketplaceMessage.action as BidMessage)
            .then(async bidCreateRequest => {
                return await this.createBid(marketplaceMessage.action as BidMessage, bidCreateRequest)
                    .then(bid => {

                        // add order.hash to the BidMessage to be sent to the seller
                        const bidMessage = marketplaceMessage.action as BidMessage;
                        bidMessage.objects = bidMessage.objects ? bidMessage.objects : [];
                        bidMessage.objects.push({
                            key: ActionMessageObjects.ORDER_HASH,
                            value: bid.OrderItem.Order.hash
                        } as KVS);

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
    public async afterPost(params: BidRequest, marketplaceMessage: MarketplaceMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        return smsgSendResponse;
    }

    /**
     * handles the received BidMessage and return SmsgMessageStatus as a result
     *
     * TODO: check whether returned SmsgMessageStatuses actually make sense and the response to those
     *
     * @param event
     */
    public async onEvent(event: MarketplaceMessageEvent): Promise<SmsgMessageStatus> {

        const smsgMessage: resources.SmsgMessage = event.smsgMessage;
        const marketplaceMessage: MarketplaceMessage = event.marketplaceMessage;
        const actionMessage: BidMessage = marketplaceMessage.action as BidMessage;

        // - first get the ListingItem the Bid is for, fail if it doesn't exist
        // - we are receiving a Bid, so we are seller, so if there's no related ListingItemTemplate.Profile -> fail

        return await this.listingItemService.findOneByHash(actionMessage.item)
            .then(async listingItemModel => {
                const listingItem: resources.ListingItem = listingItemModel.toJSON();

                // make sure the ListingItem belongs to a local Profile
                if (_.isEmpty(listingItem.ListingItemTemplate.Profile)) {
                    throw new MessageException('Received a Bid for a ListingItem not belonging to a local Profile.');
                }

                // need to add profile_id and type to the ShippingAddress to make it an AddressCreateRequest
                const address = actionMessage.buyer.shippingAddress as AddressCreateRequest;
                address.profile_id = listingItem.ListingItemTemplate.Profile.id;
                address.type = AddressType.SHIPPING_BID;

                const bidCreateParams = {
                    msgid: smsgMessage.msgid,
                    listingItem,
                    address,
                    bidder: smsgMessage.from
                    // parentBid: undefined
                } as BidCreateParams;

                // note: factory makes sure the hashes match
                return await this.bidFactory.get(bidCreateParams, actionMessage)
                    .then(async bidCreateRequest => {
                        return await this.createBid(actionMessage, bidCreateRequest)
                            .then(value => {
                                return SmsgMessageStatus.PROCESSED;
                            })
                            .catch(reason => {
                                return SmsgMessageStatus.PROCESSING_FAILED;
                            });
                    });
            })
            .catch(reason => {
                // TODO: user is receiving a Bid for his own ListingItem, so if it not found, something is seriously wrong.
                // maybe he deleted the db, or for some reason never received his own message?
                this.log.error('ERROR, reason: ', reason);
                return SmsgMessageStatus.WAITING;
            });
    }

    /**
     * - create the Bid (+BidDatas)
     * - use the Factory to create OrderCreateRequest for creating Order and OrderItems
     *   - also creates the hash, which should later be passed also to the seller
     * - create the Order with OrderItems
     *
     * @param bidMessage
     * @param bidCreateRequest
     */
    private async createBid(bidMessage: BidMessage, bidCreateRequest: BidCreateRequest): Promise<resources.Bid> {

        // TODO: supports just one OrderItem per Order
        return await this.bidService.create(bidCreateRequest)
            .then(async value => {
                const bid: resources.Bid = value.toJSON();

                // if we're the seller, we should have received the order hash from the buyer (if we're the buyere, the factory generates it)
                bidMessage.objects = bidMessage.objects ? bidMessage.objects : [];
                const hash = _.find(bidMessage.objects, (kvs: KVS) => {
                    return kvs.key === ActionMessageObjects.ORDER_HASH;
                });

                // note: when implementing support for multiple orderItems, we're using generatedAt from the Bid which will then affect the Order.hash
                const orderCreateParams = {
                    bids: [bid],
                    addressId: bid.ShippingAddress.id,
                    buyer: bid.bidder,
                    seller: bid.ListingItem.seller,
                    status: OrderStatus.PROCESSING,
                    generatedAt: bid.generatedAt,
                    hash
                } as OrderCreateParams;

                return await this.orderFactory.get(orderCreateParams/*, bidMessage*/)
                    .then(async orderCreateRequest => {
                        return await this.orderService.create(orderCreateRequest)
                            .then(async orderModel => {
                                const order: resources.Order = orderModel.toJSON();
                                this.log.debug('processAcceptBidReceivedEvent(), created Order: ', JSON.stringify(order, null, 2));
                                return await this.bidService.findOne(bid.id, true).then(bidModel => bidModel.toJSON());
                            });
                    });
            });
    }
}
