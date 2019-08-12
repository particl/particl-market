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
import { ListingItemService } from '../model/ListingItemService';
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
import { OrderStatus } from '../../enums/OrderStatus';
import { BidMessage } from '../../messages/action/BidMessage';
import { OrderItemService } from '../model/OrderItemService';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { BidAcceptMessage } from '../../messages/action/BidAcceptMessage';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { CoreRpcService } from '../CoreRpcService';
import { EscrowReleaseRequest } from '../../requests/action/EscrowReleaseRequest';
import { EscrowReleaseMessage } from '../../messages/action/EscrowReleaseMessage';
import { EscrowReleaseMessageFactory } from '../../factories/message/EscrowReleaseMessageFactory';
import { EscrowReleaseMessageCreateParams } from '../../requests/message/EscrowReleaseMessageCreateParams';
import { EscrowReleaseValidator } from '../../messages/validator/EscrowReleaseValidator';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';

export class EscrowReleaseActionService extends BaseActionService {

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
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.EscrowReleaseMessageFactory) public escrowReleaseMessageFactory: EscrowReleaseMessageFactory,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(smsgService, smsgMessageService, smsgMessageFactory);
        this.log = new Logger(__filename);
    }

    /**
     * create the MarketplaceMessage to which is to be posted to the network
     *
     * - recreate ListingItemMessage with factory
     * - find the posted BidMessage
     * - find the received BidAcceptMessage
     * - generate the releasetx using omp
     * - post the releasetx
     * - generate EscrowReleaseMessage and pass the releasetxid forward to inform the seller
     *
     * @param params
     */
    public async createMessage(params: EscrowReleaseRequest): Promise<MarketplaceMessage> {

        // note: factory checks that the hashes match
        return await this.listingItemAddActionService.createMessage({
            sendParams: {} as SmsgSendParams, // not needed, this message is not sent
            listingItem: params.bid.ListingItem
        } as ListingItemAddRequest)
            .then(async listingItemAddMPM => {

                // bidMessage is stored when received and so its msgid is stored with the bid, so we can just fetch it using the msgid
                return this.smsgMessageService.findOneByMsgId(params.bid.msgid)
                    .then(async bid => {
                        const bidSmsgMessage: resources.SmsgMessage = bid.toJSON();
                        const bidMPM: MarketplaceMessage = JSON.parse(bidSmsgMessage.text);

                        return this.smsgMessageService.findOneByMsgId(params.bidAccept.msgid)
                            .then(async bidAccept => {
                                const bidAcceptSmsgMessage: resources.SmsgMessage = bidAccept.toJSON();
                                const bidAcceptMPM: MarketplaceMessage = JSON.parse(bidAcceptSmsgMessage.text);

                                // finally use omp to generate releasetx
                                const releasetx = await this.ompService.release(
                                    listingItemAddMPM.action as ListingItemAddMessage,
                                    bidMPM.action as BidMessage,
                                    bidAcceptMPM.action as BidAcceptMessage
                                );

                                const actionMessage: EscrowReleaseMessage = await this.escrowReleaseMessageFactory.get({
                                    bidHash: params.bid.hash,
                                    memo: params.memo
                                } as EscrowReleaseMessageCreateParams);

                                // store the releasetx temporarily in the actionMessage
                                actionMessage['_releasetx'] = releasetx;

                                return {
                                    version: ompVersion(),
                                    action: actionMessage
                                } as MarketplaceMessage;
                            });
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
        return EscrowReleaseValidator.isValid(marketplaceMessage);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * - get the releasetx generated using omp-lib from the actionMessage (the temp _values will be removed automatically before message is sent)
     * - store the txid in the actionMessage
     * - and then send the rawtx
     *
     * @param params
     * @param marketplaceMessage, MPA_RELEASE
     */
    public async beforePost(params: EscrowReleaseRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        // send the release rawtx
        const releasetx = marketplaceMessage.action['_releasetx'];
        const txid = await this.coreRpcService.sendRawTransaction(releasetx);

        // add txid to the EscrowReleaseMessage to be sent to the seller
        marketplaceMessage.action.objects = marketplaceMessage.action.objects ? marketplaceMessage.action.objects : [] as KVS[];
        marketplaceMessage.action.objects.push({
            key: ActionMessageObjects.TXID_RELEASE,
            value: txid
        } as KVS);

        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid (MPA_RELEASE) in the Database
     *   - the previous Bid should be added as parentBid to create the relation
     * - call createBid to create the Bid and update Order and OrderItem statuses
     *
     * @param params
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(params: EscrowReleaseRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        const bidCreateParams = {
            listingItem: params.bid.ListingItem,
            bidder: params.bid.bidder,
            parentBid: params.bid
        } as BidCreateParams;

        await this.bidFactory.get(bidCreateParams, marketplaceMessage.action as EscrowReleaseMessage, smsgMessage)
            .then(async bidCreateRequest => {
                return await this.createBid(marketplaceMessage.action as EscrowReleaseMessage, bidCreateRequest);
            });

        return smsgSendResponse;
    }

    /**
     * - create the Bid (MPA_RELEASE) (+BidDatas copied from parentBid), with previous Bid (MPA_BID) as the parentBid
     * - update OrderItem.status
     * - update Order.status
     *
     * @param escrowReleaseMessage
     * @param bidCreateRequest
     */
    public async createBid(escrowReleaseMessage: EscrowReleaseMessage, bidCreateRequest: BidCreateRequest): Promise<resources.Bid> {

        return await this.bidService.create(bidCreateRequest)
            .then(async value => {
                const bid: resources.Bid = value.toJSON();

                await this.orderItemService.updateStatus(bid.ParentBid.OrderItem.id, OrderItemStatus.COMPLETE);
                await this.orderService.updateStatus(bid.ParentBid.OrderItem.Order.id, OrderStatus.COMPLETE);

                return await this.bidService.findOne(bid.id, true).then(bidModel => bidModel.toJSON());
            });
    }
}
