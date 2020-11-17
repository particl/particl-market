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
import { EscrowType, MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { SmsgMessageFactory } from '../../factories/model/SmsgMessageFactory';
import { ListingItemAddActionService } from './ListingItemAddActionService';
import { OmpService } from '../OmpService';
import { OrderStatus } from '../../enums/OrderStatus';
import { BidMessage } from '../../messages/action/BidMessage';
import { OrderItemService } from '../model/OrderItemService';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { EscrowLockRequest } from '../../requests/action/EscrowLockRequest';
import { EscrowLockValidator } from '../../messagevalidators/EscrowLockValidator';
import { EscrowLockMessage } from '../../messages/action/EscrowLockMessage';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { CoreRpcService } from '../CoreRpcService';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionDirection } from '../../enums/ActionDirection';
import { BaseBidActionService } from '../BaseBidActionService';
import { NotifyService } from '../NotifyService';
import { MarketplaceNotification } from '../../messages/MarketplaceNotification';
import { EscrowLockMessageFactory } from '../../factories/message/EscrowLockMessageFactory';
import { BlacklistService } from '../model/BlacklistService';


export class EscrowLockActionService extends BaseBidActionService {

    constructor(
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.NotifyService) public notificationService: NotifyService,
        @inject(Types.Service) @named(Targets.Service.OmpService) public ompService: OmpService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) public coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.action.ListingItemAddActionService) public listingItemAddActionService: ListingItemAddActionService,
        @inject(Types.Service) @named(Targets.Service.model.SmsgMessageService) public smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.model.SmsgMessageFactory) public smsgMessageFactory: SmsgMessageFactory,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.BidService) public bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.model.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.model.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.model.BlacklistService) public blacklistService: BlacklistService,
        @inject(Types.Factory) @named(Targets.Factory.model.BidFactory) public bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.message.EscrowLockMessageFactory) public actionMessageFactory: EscrowLockMessageFactory,
        @inject(Types.MessageValidator) @named(Targets.MessageValidator.EscrowLockValidator) public validator: EscrowLockValidator,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(MPAction.MPA_LOCK,
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
     * - generate EscrowLockMessage with omp using recreated ListingItemMessage and previously stored BidMessage and BidAcceptMessage
     *
     * @param actionRequest
     */
    public async createMarketplaceMessage(actionRequest: EscrowLockRequest): Promise<MarketplaceMessage> {
        return await this.actionMessageFactory.get(actionRequest);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * @param actionRequest
     * @param marketplaceMessage, omp generated MPA_ACCEPT
     */
    public async beforePost(actionRequest: EscrowLockRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        if (actionRequest.bid.ListingItem.PaymentInformation.Escrow.type === EscrowType.MULTISIG) {
            // send the lock rawtx
            const bidtx = marketplaceMessage.action['_rawbidtx'];
            const txid = await this.coreRpcService.sendRawTransaction(bidtx);
            delete marketplaceMessage.action['_rawbidtx'];

            // add txid to the EscrowLockMessage to be sent to the seller
            const bidMessage = marketplaceMessage.action as BidMessage;
            bidMessage.objects = bidMessage.objects ? bidMessage.objects : [];
            bidMessage.objects.push({
                key: ActionMessageObjects.TXID_LOCK,
                value: txid
            } as KVS);
        }

        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid (MPA_ACCEPT) in the Database
     *   - the previous Bid should be added as parentBid to create the relation
     * - call createBid to create the Bid and update Order and OrderItem statuses
     *
     * @param actionRequest
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(actionRequest: EscrowLockRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        return smsgSendResponse;
    }

    /**
     * - create the Bid (MPA_LOCK) (+BidDatas copied from parentBid), with previous Bid (MPA_BID) as the parentBid
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
                                actionRequest?: EscrowLockRequest): Promise<resources.SmsgMessage> {

        const escrowLockMessage: EscrowLockMessage = marketplaceMessage.action as EscrowLockMessage;
        const bidCreateRequest: BidCreateRequest = await this.createChildBidCreateRequest(escrowLockMessage, smsgMessage);

        await this.bidService.create(bidCreateRequest)
            .then(async value => {
                const bid: resources.Bid = value.toJSON();

                // mp@0.1.7: because of a bug in smsg, some messages might not have been received and 'smsg resend'-command was added to allow resending
                // those smsgmessages to fix the buy flow. it was possible for buyers to not receive the MPA_COMPLETE, but receive the next MPA_SHIP which
                // the seller sends after the MPA_COMPLETE. Now, if seller resends the MPA_COMPLETE after MPA_SHIP has been received, the Order and OrderItem
                // statuses will be set to incorrect values and the buyer would be incorrectly again waiting for the MPA_SHIP message to arrive and wont be
                // able to send the MPA_RELEASE message to the seller.

                // to fix this, update the statuses only if they are in the expected previous state set by MPA_ACCEPT (AWAITING_ESCROW)
                if (bid.ParentBid.OrderItem.status === OrderItemStatus.AWAITING_ESCROW
                    && bid.ParentBid.OrderItem.Order.status === OrderStatus.PROCESSING) {
                    await this.orderItemService.updateStatus(bid.ParentBid.OrderItem.id, OrderItemStatus.ESCROW_LOCKED);
                    await this.orderService.updateStatus(bid.ParentBid.OrderItem.Order.id, OrderStatus.PROCESSING);
                }

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
