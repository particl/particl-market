// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import {inject, named} from 'inversify';
import {ompVersion} from 'omp-lib';
import {Logger as LoggerType} from '../../../core/Logger';
import {Core, Targets, Types} from '../../../constants';
import {EventEmitter} from 'events';
import {BidService} from '../model/BidService';
import {BidFactory} from '../../factories/model/BidFactory';
import {SmsgService} from '../SmsgService';
import {ListingItemService} from '../model/ListingItemService';
import {SmsgSendResponse} from '../../responses/SmsgSendResponse';
import {MarketplaceMessage} from '../../messages/MarketplaceMessage';
import {OrderService} from '../model/OrderService';
import {SmsgMessageService} from '../model/SmsgMessageService';
import {BaseActionService} from './BaseActionService';
import {SmsgMessageFactory} from '../../factories/model/SmsgMessageFactory';
import {BidRequest} from '../../requests/action/BidRequest';
import {ListingItemAddRequest} from '../../requests/action/ListingItemAddRequest';
import {ListingItemAddActionService} from './ListingItemAddActionService';
import {SmsgSendParams} from '../../requests/action/SmsgSendParams';
import {OmpService} from '../OmpService';
import {BidConfiguration} from 'omp-lib/dist/interfaces/configs';
import {Cryptocurrency} from 'omp-lib/dist/interfaces/crypto';
import {ListingItemAddMessage} from '../../messages/action/ListingItemAddMessage';
import {BidValidator} from '../../messages/validator/BidValidator';
import {BidMessage} from '../../messages/action/BidMessage';
import {BidCreateParams, OrderCreateParams} from '../../factories/model/ModelCreateParams';
import {BidCreateRequest} from '../../requests/model/BidCreateRequest';
import {ShippingAddress} from 'omp-lib/dist/interfaces/omp';
import {OrderFactory} from '../../factories/model/OrderFactory';
import {KVS} from 'omp-lib/dist/interfaces/common';
import {ActionMessageObjects} from '../../enums/ActionMessageObjects';
import {OrderCreateRequest} from '../../requests/model/OrderCreateRequest';
import {ConfigurableHasher} from 'omp-lib/dist/hasher/hash';
import {HashableOrderCreateRequestConfig} from '../../factories/hashableconfig/createrequest/HashableOrderCreateRequestConfig';
import {ActionDirection} from '../../enums/ActionDirection';
import {OrderStatus} from '../../enums/OrderStatus';

export class BidActionService extends BaseActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Service) @named(Targets.Service.OmpService) public ompService: OmpService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Factory) @named(Targets.Factory.model.OrderFactory) public orderFactory: OrderFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(smsgService, smsgMessageService, smsgMessageFactory);
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

        // todo: cryptocurrency hardcoded to PART for now
        // todo: ...and propably hardcoded already on the Command level, so could be passed with the BidRequest params
        const config: BidConfiguration = {
            cryptocurrency: Cryptocurrency.PART,
            escrow: params.listingItem.PaymentInformation.Escrow.type,
            shippingAddress: params.address as ShippingAddress
            // objects: KVS[]       // todo: product variations etc bid related params
        };

        // use omp to generate BidMessage
        return await this.ompService.bid(config, listingItemAddMPM.action as ListingItemAddMessage);
    }

    /**
     * validate the MarketplaceMessage to which is to be posted to the network.
     * called directly after createMessage to validate the creation.
     *
     * @param marketplaceMessage
     */
    public async validateMessage(marketplaceMessage: MarketplaceMessage): Promise<boolean> {
        return BidValidator.isValid(marketplaceMessage);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * - create a hash for the Order so it can be sent to the seller
     *
     * @param params
     * @param marketplaceMessage
     */
    public async beforePost(params: BidRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        const orderHash = ConfigurableHasher.hash({
            buyer: params.sendParams.fromAddress,
            seller: params.listingItem.seller,
            generatedAt: +new Date().getTime()
        } as OrderCreateRequest, new HashableOrderCreateRequestConfig());

        // add the created orderHash to the marketplaceMessage.action.objects to be sent to the seller
        marketplaceMessage.action.objects = marketplaceMessage.action.objects ? marketplaceMessage.action.objects : [];
        marketplaceMessage.action.objects.push({
            key: ActionMessageObjects.ORDER_HASH,
            value: orderHash
        } as KVS);

        return marketplaceMessage;

    }

    /**
     * called after post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid in the Database
     * - call createBid to create the Bid and other related models
     *
     * @param params
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(params: BidRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        const bidCreateParams = {
            listingItem: params.listingItem,
            address: params.address,
            bidder: params.sendParams.fromAddress
            // parentBid: undefined
        } as BidCreateParams;

        await this.bidFactory.get(bidCreateParams, marketplaceMessage.action as BidMessage, smsgMessage)
            .then(async bidCreateRequest => {
                return await this.createBid(marketplaceMessage.action as BidMessage, bidCreateRequest, smsgMessage);
            });

        return smsgSendResponse;
    }

    /**
     * - create the Bid (+BidDatas)
     * - use the Factory to create OrderCreateRequest for creating Order and OrderItems
     *   - also creates the hash, which should later be passed also to the seller
     * - create the Order with OrderItems
     *
     * @param bidMessage
     * @param bidCreateRequest
     * @param smsgMessage
     */
    public async createBid(bidMessage: BidMessage, bidCreateRequest: BidCreateRequest, smsgMessage: resources.SmsgMessage): Promise<resources.Bid> {

        // this.log.debug('createBid()');

        // TODO: supports just one OrderItem per Order
        return await this.bidService.create(bidCreateRequest)
            .then(async value => {
                const bid: resources.Bid = value.toJSON();

                this.log.debug('createBid(), bid: ', JSON.stringify(bid, null, 2));

                // if we're the buyer, Order hash was generated before posting the BidMessage to the seller
                // if we're the seller, we should have received the Order hash from the buyer in the message
                bidMessage.objects = bidMessage.objects ? bidMessage.objects : [];
                const orderHash = _.find(bidMessage.objects, (kvs: KVS) => {
                    return kvs.key === ActionMessageObjects.ORDER_HASH;
                });

                this.log.debug('createBid(), orderHash: ', orderHash);

                const orderCreateParams = {
                    bids: [bid],
                    addressId: bid.ShippingAddress.id,
                    buyer: bid.bidder,
                    seller: bid.ListingItem.seller,
                    status: smsgMessage.direction === ActionDirection.INCOMING ? OrderStatus.RECEIVED : OrderStatus.SENT,
                    generatedAt: bid.generatedAt,
                    hash: orderHash!.value
                } as OrderCreateParams;

                // this.log.debug('createBid(), orderCreateParams: ', JSON.stringify(orderCreateParams, null, 2));

                // OrderFactory creates also the OrderItemCreateRequests
                return await this.orderFactory.get(orderCreateParams/*, bidMessage*/)
                    .then(async orderCreateRequest => {
                        // this.log.debug('createBid(), orderCreateRequest: ', JSON.stringify(orderCreateRequest, null, 2));

                        return await this.orderService.create(orderCreateRequest)
                            .then(async orderModel => {
                                const order: resources.Order = orderModel.toJSON();
                                this.log.debug('createBid(), created Order: ', JSON.stringify(order, null, 2));
                                return await this.bidService.findOne(bid.id, true).then(bidModel => bidModel.toJSON());
                            });
                    });
            });
    }

}
