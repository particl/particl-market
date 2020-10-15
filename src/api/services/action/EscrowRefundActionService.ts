// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ListingItemAddActionService } from './ListingItemAddActionService';
import { OmpService } from '../OmpService';
import { OrderStatus } from '../../enums/OrderStatus';
import { OrderItemService } from '../model/OrderItemService';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { CoreRpcService } from '../CoreRpcService';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { EscrowRefundMessage } from '../../messages/action/EscrowRefundMessage';
import { EscrowRefundMessageFactory } from '../../factories/message/EscrowRefundMessageFactory';
import { EscrowRefundRequest } from '../../requests/action/EscrowRefundRequest';
import { EscrowRefundValidator } from '../../messagevalidators/EscrowRefundValidator';
import { MPActionExtended } from '../../enums/MPActionExtended';
import { NotificationService } from '../NotificationService';
import { BaseBidActionService } from '../BaseBidActionService';
import { ActionDirection } from '../../enums/ActionDirection';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { BlacklistService } from '../model/BlacklistService';


export class EscrowRefundActionService extends BaseBidActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.NotificationService) public notificationService: NotificationService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.OmpService) public ompService: OmpService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) public blacklistService: BlacklistService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.EscrowRefundMessageFactory) public actionMessageFactory: EscrowRefundMessageFactory,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.EscrowRefundValidator) public validator: EscrowRefundValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(MPActionExtended.MPA_REFUND,
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
     * - recreate ListingItemMessage with factory
     * - find the posted BidMessage
     * - find the received BidAcceptMessage
     * - generate the refundtx using omp
     * - post the refundtx
     * - generate EscrowRefundMessage and pass the refundtxid forward to inform the seller
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: EscrowRefundRequest): Promise<MarketplaceMessage> {
        return await this.actionMessageFactory.get(actionRequest);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * - get the refundtx generated using omp-lib from the actionMessage (the temp _values will be removed automatically before message is sent)
     * - store the txid in the actionMessage
     * - and then send the rawtx
     *
     * @param actionRequest
     * @param marketplaceMessage, MPA_REFUND
     */
    public async beforePost(actionRequest: EscrowRefundRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        // send the refund rawtx
        const refundtx = marketplaceMessage.action['_refundtx'];
        const txid = await this.coreRpcService.sendRawTransaction(refundtx);
        delete marketplaceMessage.action['_refundtx'];

        // add txid to the EscrowRefundMessage to be sent to the seller
        marketplaceMessage.action.objects = marketplaceMessage.action.objects ? marketplaceMessage.action.objects : [] as KVS[];
        marketplaceMessage.action.objects.push({
            key: ActionMessageObjects.TXID_REFUND,
            value: txid
        } as KVS);


        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid (MPA_REFUND) in the Database
     *   - the previous Bid should be added as parentBid to create the relation
     * - call createBid to create the Bid and update Order and OrderItem statuses
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(actionRequest: EscrowRefundRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        return smsgSendResponse;
    }



    /**
     * - create the Bid (MPA_REFUND) (+BidDatas copied from parentBid), with previous Bid (MPA_BID) as the parentBid
     * - update OrderItem.status
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
                                actionRequest?: EscrowRefundRequest): Promise<resources.SmsgMessage> {

        const escrowRefundMessage: EscrowRefundMessage = marketplaceMessage.action as EscrowRefundMessage;
        const bidCreateRequest: BidCreateRequest = await this.createChildBidCreateRequest(escrowRefundMessage, smsgMessage);

        await this.bidService.create(bidCreateRequest)
            .then(async value => {
                const bid: resources.Bid = value.toJSON();

                await this.orderItemService.updateStatus(bid.ParentBid.OrderItem.id, OrderItemStatus.ESCROW_REFUNDED);
                await this.orderService.updateStatus(bid.ParentBid.OrderItem.Order.id, OrderStatus.REFUNDED);

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
