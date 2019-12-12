// Copyright (c) 2017-2019, The Particl Market developers
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
import { EscrowType } from 'omp-lib/dist/interfaces/omp-enums';
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
import { EscrowLockRequest } from '../../requests/action/EscrowLockRequest';
import { EscrowLockValidator } from '../../messages/validator/EscrowLockValidator';
import { EscrowLockMessage } from '../../messages/action/EscrowLockMessage';
import { BidAcceptMessage } from '../../messages/action/BidAcceptMessage';
import { BidCreateRequest } from '../../requests/model/BidCreateRequest';
import { CoreRpcService } from '../CoreRpcService';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionDirection } from '../../enums/ActionDirection';

export class EscrowLockActionService extends BaseActionService {

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
     * - generate EscrowLockMessage with omp using recreated ListingItemMessage and previously stored BidMessage and BidAcceptMessage
     *
     * @param params
     */
    public async createMessage(params: EscrowLockRequest): Promise<MarketplaceMessage> {

        // note: factory checks that the hashes match
        return await this.listingItemAddActionService.createMessage({
            sendParams: {} as SmsgSendParams, // not needed, this message is not sent
            listingItem: params.bid.ListingItem
        } as ListingItemAddRequest)
            .then(async listingItemAddMPM => {

                // this.log.debug('params: ', JSON.stringify(params, null, 2));
                // bidMessage is stored when received and so its msgid is stored with the bid, so we can just fetch it using the msgid
                return this.smsgMessageService.findOneByMsgId(params.bid.msgid, ActionDirection.OUTGOING)
                    .then(async bid => {

                        const bidSmsgMessage: resources.SmsgMessage = bid.toJSON();
                        const bidMPM: MarketplaceMessage = JSON.parse(bidSmsgMessage.text);
                        // this.log.debug('createMessage(), bidMPM:', JSON.stringify(bidMPM, null, 2));

                        return this.smsgMessageService.findOneByMsgId(params.bidAccept.msgid, ActionDirection.INCOMING)
                            .then(async bidAccept => {

                                const bidAcceptSmsgMessage: resources.SmsgMessage = bidAccept.toJSON();
                                const bidAcceptMPM: MarketplaceMessage = JSON.parse(bidAcceptSmsgMessage.text);
                                // this.log.debug('createMessage(), bidAcceptMPM:', JSON.stringify(bidMPM, null, 2));

                                // finally use omp to generate EscrowLockMessage
                                return await this.ompService.lock(
                                    params.sendParams.wallet,
                                    listingItemAddMPM.action as ListingItemAddMessage,
                                    bidMPM.action as BidMessage,
                                    bidAcceptMPM.action as BidAcceptMessage
                                );
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
        this.log.debug('validate, marketplaceMessage: ', JSON.stringify(marketplaceMessage, null, 2));
        return EscrowLockValidator.isValid(marketplaceMessage);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * @param params
     * @param marketplaceMessage, omp generated MPA_ACCEPT
     */
    public async beforePost(params: EscrowLockRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {
        return marketplaceMessage;
    }

    /**
     * called after post is executed and message is sent
     *
     * - create the bidCreateRequest to save the Bid (MPA_ACCEPT) in the Database
     *   - the previous Bid should be added as parentBid to create the relation
     * - call createBid to create the Bid and update Order and OrderItem statuses
     *
     * @param params
     * @param marketplaceMessage
     * @param smsgMessage
     * @param smsgSendResponse
     */
    public async afterPost(params: EscrowLockRequest, marketplaceMessage: MarketplaceMessage, smsgMessage: resources.SmsgMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {

        const bidCreateParams = {
            listingItem: params.bid.ListingItem,
            bidder: params.bid.bidder,
            parentBid: params.bid
        } as BidCreateParams;

        await this.bidFactory.get(bidCreateParams, marketplaceMessage.action as EscrowLockMessage, smsgMessage)
            .then(async bidCreateRequest => {
                return await this.createBid(marketplaceMessage.action as EscrowLockMessage, bidCreateRequest)
                    .then(async value => {

                        this.log.debug('beforePost(): created new bid: ', JSON.stringify(value, null, 2));

                        if (params.bid.ListingItem.PaymentInformation.Escrow.type === EscrowType.MULTISIG) {
                            // send the lock rawtx
                            const bidtx = marketplaceMessage.action['_rawbidtx'];
                            const txid = await this.coreRpcService.sendRawTransaction(bidtx);

                            // add txid to the EscrowLockMessage to be sent to the seller
                            const bidMessage = marketplaceMessage.action as BidMessage;
                            bidMessage.objects = bidMessage.objects ? bidMessage.objects : [];
                            bidMessage.objects.push({
                                key: ActionMessageObjects.TXID_LOCK,
                                value: txid
                            } as KVS);
                        }
                    });
            });

        return smsgSendResponse;
    }

    /**
     * - create the Bid (MPA_LOCK) (+BidDatas copied from parentBid), with previous Bid (MPA_BID) as the parentBid
     * - update OrderItem.status -> AWAITING_ESCROW
     * - update Order.status
     *
     * @param escrowLockMessage
     * @param bidCreateRequest
     */
    public async createBid(escrowLockMessage: EscrowLockMessage,  bidCreateRequest: BidCreateRequest): Promise<resources.Bid> {

        return await this.bidService.create(bidCreateRequest)
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
    }
}
