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
import { MPActionExtended } from '../../enums/MPActionExtended';
import { KVS } from 'omp-lib/dist/interfaces/common';
import { ActionMessageObjects } from '../../enums/ActionMessageObjects';
import { EscrowLockMessage } from '../../messages/action/EscrowLockMessage';
import { EscrowCompleteMessageFactory } from '../../factories/message/EscrowCompleteMessageFactory';
import { EscrowCompleteRequest } from '../../requests/action/EscrowCompleteRequest';
import { EscrowCompleteMessage } from '../../messages/action/EscrowCompleteMessage';
import { EscrowCompleteMessageCreateParams } from '../../requests/message/EscrowCompleteMessageCreateParams';
import { EscrowCompleteValidator } from '../../messages/validator/EscrowCompleteValidator';

export class EscrowCompleteActionService extends BaseActionService {

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
        @inject(Types.Factory) @named(Targets.Factory.message.EscrowCompleteMessageFactory) public escrowCompleteMessageFactory: EscrowCompleteMessageFactory,
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
     * - generate the completetx using omp
     * - post the completetx
     * - generate EscrowCompleteMessage and pass the completetxid forward to inform the seller
     *
     * @param params
     */
    public async createMessage(params: EscrowCompleteRequest): Promise<MarketplaceMessage> {

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

                                return this.smsgMessageService.findOneByMsgId(params.escrowLock.msgid)
                                    .then(async escrowLock => {
                                        const escrowLockSmsgMessage: resources.SmsgMessage = escrowLock.toJSON();
                                        const escrowLockMPM: MarketplaceMessage = JSON.parse(escrowLockSmsgMessage.text);

                                        // finally use omp to generate completetx
                                        const completetx = await this.ompService.complete(
                                            listingItemAddMPM.action as ListingItemAddMessage,
                                            bidMPM.action as BidMessage,
                                            bidAcceptMPM.action as BidAcceptMessage,
                                            escrowLockMPM.action as EscrowLockMessage
                                        );

                                        const actionMessage: EscrowCompleteMessage = await this.escrowCompleteMessageFactory.get({
                                            bidHash: params.bid.hash,
                                            memo: params.memo
                                        } as EscrowCompleteMessageCreateParams);

                                        // store the completetx temporarily in the actionMessage
                                        actionMessage['_completetx'] = completetx;

                                        return {
                                            version: ompVersion(),
                                            action: actionMessage
                                        } as MarketplaceMessage;
                                    });
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
        return EscrowCompleteValidator.isValid(marketplaceMessage);
    }

    /**
     * called after createMessage and before post is executed and message is sent
     *
     * - get the completetx generated using omp-lib from the actionMessage (the temp _values will be removed automatically before message is sent)
     * - store the txid in the actionMessage
     * - and then send the rawtx
     * - create the bidCreateRequest to save the Bid (MPA_COMPLETE) in the Database
     *   - the previous Bid should be added as parentBid to create the relation
     * - call createBid to create the Bid and update Order and OrderItem statuses
     *
     * @param params
     * @param marketplaceMessage, MPA_COMPLETE
     */
    public async beforePost(params: EscrowCompleteRequest, marketplaceMessage: MarketplaceMessage): Promise<MarketplaceMessage> {

        // send the complete rawtx
        const completetx = marketplaceMessage.action['_completetx'];
        const txid = await this.coreRpcService.sendRawTransaction(completetx);

        // add txid to the EscrowCompleteMessage to be sent to the seller
        marketplaceMessage.action.objects = marketplaceMessage.action.objects ? marketplaceMessage.action.objects : [] as KVS[];
        marketplaceMessage.action.objects.push({
            key: ActionMessageObjects.TXID_COMPLETE,
            value: txid
        } as KVS);

        // msgid is not set here, its updated in the afterPost
        const bidCreateParams = {
            listingItem: params.bid.ListingItem,
            bidder: params.bid.bidder,
            parentBid: params.bid
        } as BidCreateParams;

        return await this.bidFactory.get(bidCreateParams, marketplaceMessage.action as EscrowCompleteMessage)
            .then(async bidCreateRequest => {
                return await this.createBid(marketplaceMessage.action as EscrowCompleteMessage, bidCreateRequest)
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
    public async afterPost(params: EscrowCompleteRequest, marketplaceMessage: MarketplaceMessage,
                           smsgSendResponse: SmsgSendResponse): Promise<SmsgSendResponse> {
        // todo: stupid fix for possible undefined which shouldnt even happen, fix the real cause
        smsgSendResponse.msgid =  smsgSendResponse.msgid ? smsgSendResponse.msgid : '';
        await this.bidService.updateMsgId(params.createdBid.id, smsgSendResponse.msgid);
        return smsgSendResponse;
    }

    /**
     * - create the Bid (MPA_COMPLETE) (+BidDatas copied from parentBid), with previous Bid (MPA_BID) as the parentBid
     * - update OrderItem.status
     * - update Order.status
     *
     * @param escrowCompleteMessage
     * @param bidCreateRequest
     */
    public async createBid(escrowCompleteMessage: EscrowCompleteMessage,  bidCreateRequest: BidCreateRequest): Promise<resources.Bid> {

        // TODO: currently we support just one OrderItem per Order
        return await this.bidService.create(bidCreateRequest)
            .then(async value => {
                const bid: resources.Bid = value.toJSON();

                await this.orderItemService.updateStatus(bid.ParentBid.OrderItem.id, OrderItemStatus.COMPLETE);
                await this.orderService.updateStatus(bid.ParentBid.OrderItem.Order.id, OrderStatus.COMPLETE);

                return await this.bidService.findOne(bid.id, true).then(bidModel => bidModel.toJSON());
            });
    }
}
