import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import * as resources from 'resources';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';

import { EventEmitter } from 'events';
import { ActionMessageService } from './ActionMessageService';
import { EscrowService } from './EscrowService';
import { ListingItemService } from './ListingItemService';
import { MessageException } from '../exceptions/MessageException';
import * as _ from 'lodash';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { OrderFactory } from '../factories/OrderFactory';
import { OrderService } from './OrderService';
import { SmsgService } from './SmsgService';
import { CoreRpcService } from './CoreRpcService';
import { EscrowFactory } from '../factories/EscrowFactory';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { EscrowRequest } from '../requests/EscrowRequest';
import { OrderStatus } from '../enums/OrderStatus';
import { Output } from 'resources';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { OrderItemObjectService } from './OrderItemObjectService';
import { OrderItemObjectCreateRequest } from '../requests/OrderItemObjectCreateRequest';
import { OrderItemObjectUpdateRequest } from '../requests/OrderItemObjectUpdateRequest';
import { EscrowMessage } from '../messages/EscrowMessage';
import { OrderItemUpdateRequest } from '../requests/OrderItemUpdateRequest';
import { OrderItemService } from './OrderItemService';
import {OrderSearchParams} from '../requests/OrderSearchParams';

export class EscrowActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) public actionMessageService: ActionMessageService,
        @inject(Types.Service) @named(Targets.Service.EscrowService) public escrowService: EscrowService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) public smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.OrderService) public orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.OrderItemService) public orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.OrderItemObjectService) public orderItemObjectService: OrderItemObjectService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Factory) @named(Targets.Factory.EscrowFactory) private escrowFactory: EscrowFactory,
        @inject(Types.Factory) @named(Targets.Factory.OrderFactory) private orderFactory: OrderFactory,
        @inject(Types.Core) @named(Core.Events) public eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * Send the lock message for the given OrderItem
     *
     * @param {"resources".OrderItem} orderItem
     * @returns {Promise<SmsgSendResponse>}
     */
    public async lock(escrowRequest: EscrowRequest): Promise<SmsgSendResponse> {

        // todo: add @validate to EscrowLockRequest

        const orderItem = escrowRequest.orderItem;
        const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;

        if (_.isEmpty(orderItem)) {
            throw new MessageException('OrderItem not found!');
        }

        if (_.isEmpty(escrow)) {
            throw new MessageException('Escrow not found!');
        }

        // generate rawtx
        const rawtx = await this.createRawTx(escrowRequest);
        const updatedRawTx = await this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);

        // update OrderItemStatus
        const newOrderStatus = OrderStatus.ESCROW_LOCKED;
        const updatedOrderItem = await this.updateOrderItemStatus(orderItem, newOrderStatus);

        // use escrowfactory to generate the lock message
        const escrowActionMessage = await this.escrowFactory.getMessage(escrowRequest, rawtx);

        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: escrowActionMessage
        } as MarketplaceMessage;

        return await this.smsgService.smsgSend(orderItem.Order.buyer, orderItem.Order.seller, marketPlaceMessage, false);
    }

    public async refund(escrowRequest: EscrowRequest): Promise<SmsgSendResponse> {

        throw new NotImplementedException();

        // todo: refactor lock/refund/release since they're pretty much the same
        // todo: add @validate to EscrowLockRequest
/*
        const orderItem = escrowRequest.orderItem;
        const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;

        if (_.isEmpty(orderItem)) {
            throw new MessageException('OrderItem not found!');
        }

        if (_.isEmpty(escrow)) {
            throw new MessageException('Escrow not found!');
        }

        const listingItemModel = await this.listingItemService.findOneByHash(orderItem.itemHash);
        const listingItem = listingItemModel.toJSON();

        // generate rawtx
        const rawtx = await this.createRawTx(escrowRequest, listingItem);

        const updatedRawTx = await this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);

        // update OrderStatus
        const newOrderStatus = OrderStatus.CHANGE;
        const updatedOrderItem = await this.updateOrderItemStatus(orderItem, newOrderStatus);

        // use escrowfactory to generate the refund message
        const escrowActionMessage = await this.escrowFactory.getMessage(escrowRequest, rawtx);

        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: escrowActionMessage
        } as MarketplaceMessage;

        return await this.smsgService.smsgSend(orderItem.Order.seller, orderItem.Order.buyer, marketPlaceMessage, false);
*/
    }

    public async release(escrowRequest: EscrowRequest): Promise<SmsgSendResponse> {

        // todo: refactor lock/refund/release since they're pretty much the same
        // todo: add @validate to EscrowLockRequest

        const orderItem = escrowRequest.orderItem;
        const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;

        if (_.isEmpty(orderItem)) {
            throw new MessageException('OrderItem not found!');
        }

        if (_.isEmpty(escrow)) {
            throw new MessageException('Escrow not found!');
        }

        // generate rawtx
        const rawtx = await this.createRawTx(escrowRequest);

        const updatedRawTx = await this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);

        // update OrderStatus
        const isMyListingItem = !_.isEmpty(orderItem.Bid.ListingItem.ListingItemTemplate);
        const newOrderStatus = isMyListingItem ? OrderStatus.SHIPPING : OrderStatus.COMPLETE;
        const updatedOrderItem = await this.updateOrderItemStatus(orderItem, newOrderStatus);

        // use escrowfactory to generate the release message
        const escrowActionMessage = await this.escrowFactory.getMessage(escrowRequest, rawtx);

        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: escrowActionMessage
        } as MarketplaceMessage;

        const sendFromAddress = isMyListingItem ? orderItem.Order.seller : orderItem.Order.buyer;
        const sendToAddress = isMyListingItem ? orderItem.Order.buyer : orderItem.Order.seller;

        return await this.smsgService.smsgSend(sendFromAddress, sendToAddress, marketPlaceMessage, false);
    }

    /**
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<"resources".ActionMessage>}
     */
    public async processLockEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.Order> {

        // TODO: EscrowMessage should contain Order.hash to identify the item in case there are two different Orders
        // with the same item for same buyer. Currently, buyer can only bid once for an item, but this might not be the case always.

        this.log.info('Received event:', event);

        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        const escrowMessage = message.mpaction as EscrowMessage;
        const listingItemHash = escrowMessage.item;

        // find the ListingItem
        const listingItemModel = await this.listingItemService.findOneByHash(listingItemHash);
        const listingItem = listingItemModel.toJSON();

        const seller = listingItem.seller;
        const buyer = listingItem.seller === event.smsgMessage.from ? event.smsgMessage.to : event.smsgMessage.from;

        // save ActionMessage
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
        const actionMessage = actionMessageModel.toJSON();

        // find Order, using buyer, seller and Order.OrderItem.itemHash
        const ordersModel = await this.orderService.search({
            listingItemHash,
            buyerAddress: buyer,
            sellerAddress: seller
        } as OrderSearchParams);
        const orders = ordersModel.toJSON();

        if (orders.length === 0) {
            this.log.error('Order not found for EscrowMessage.');
            throw new MessageException('Order not found for EscrowMessage.');
        }

        if (orders.length > 1) {
            this.log.error('Multiple Orders found for EscrowMessage, this should not happen.');
            throw new MessageException('Multiple Orders found for EscrowMessage.');
        }

        // update OrderItemStatus
        const order: resources.Order = orders[0];
        const orderItem = _.find(order.OrderItems, (o: resources.OrderItem) => {
            return o.itemHash === listingItemHash;
        });

        if (orderItem) {

            // update rawtx
            const rawtx = escrowMessage.escrow.rawtx;
            const updatedRawTx = await this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);

            const newOrderStatus = OrderStatus.ESCROW_LOCKED;
            const updatedOrderItem = await this.updateOrderItemStatus(orderItem, newOrderStatus);

            // TODO: do whatever else needs to be done


        } else {
            this.log.error('OrderItem not found for EscrowMessage.');
            throw new MessageException('OrderItem not found for EscrowMessage.');
        }

        return order;
    }

    public async processReleaseEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.Order> {

        this.log.info('Received event:', event);

        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        const escrowMessage = message.mpaction as EscrowMessage;
        const listingItemHash = escrowMessage.item;

        // find the ListingItem
        const listingItemModel = await this.listingItemService.findOneByHash(listingItemHash);
        const listingItem: resources.ListingItem = listingItemModel.toJSON();

        const seller = listingItem.seller;
        const buyer = listingItem.seller === event.smsgMessage.from ? event.smsgMessage.to : event.smsgMessage.from;
        const isMyListingItem = !!listingItem.ListingItemTemplate;

        // save ActionMessage
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
        const actionMessage = actionMessageModel.toJSON();

        // find Order, using buyer, seller and Order.OrderItem.itemHash
        const ordersModel = await this.orderService.search({
            listingItemHash,
            buyerAddress: buyer,
            sellerAddress: seller
        } as OrderSearchParams);
        const orders = ordersModel.toJSON();

        if (orders.length === 0) {
            this.log.error('Order not found for EscrowMessage.');
            throw new MessageException('Order not found for EscrowMessage.');
        }

        if (orders.length > 1) {
            this.log.error('Multiple Orders found for EscrowMessage, this should not happen.');
            throw new MessageException('Multiple Orders found for EscrowMessage.');
        }

        // update OrderItemStatus
        const order: resources.Order = orders[0];
        const orderItem = _.find(order.OrderItems, (o: resources.OrderItem) => {
            return o.itemHash === listingItemHash;
        });

        if (orderItem) {

            // update rawtx
            const rawtx = escrowMessage.escrow.rawtx;
            const updatedRawTx = await this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);


            const newOrderStatus = isMyListingItem ? OrderStatus.COMPLETE : OrderStatus.SHIPPING;
            const updatedOrderItem = await this.updateOrderItemStatus(orderItem, newOrderStatus);

            // TODO: do whatever else needs to be done


        } else {
            this.log.error('OrderItem not found for EscrowMessage.');
            throw new MessageException('OrderItem not found for EscrowMessage.');
        }

        return order;
    }

    public async processRequestRefundEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // find the ListingItem
        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }
        const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.item);
        const listingItem = listingItemModel.toJSON();

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    public async processRefundEscrowReceivedEvent(event: MarketplaceEvent): Promise<resources.ActionMessage> {

        this.log.info('Received event:', event);

        // find the ListingItem
        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }
        const listingItemModel = await this.listingItemService.findOneByHash(message.mpaction.item);
        const listingItem = listingItemModel.toJSON();

        // first save it
        const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
        const actionMessage = actionMessageModel.toJSON();

        // TODO: do whatever else needs to be done

        return actionMessage;
    }

    /**
     * Creates rawtx based on params
     *
     * @param request
     * @param escrow
     * @returns {string}
     */
    public async createRawTx(request: EscrowRequest, testRun: boolean = false): Promise<string> {

        // MPA_LOCK:
        //
        //

        // MPA_RELEASE:
        // rawtx: 'The buyer sends the half signed rawtx which releases the escrow and payment.
        // The vendor then recreates the whole transaction (check ouputs, inputs, scriptsigs
        // and the fee), verifying that buyer\'s rawtx is indeed legitimate. The vendor then
        // signs the rawtx and broadcasts it.'

        // MPA_REFUND
        // rawtx: 'The vendor decodes the rawtx from MP_REQUEST_REFUND and recreates the whole
        // transaction (check ouputs, inputs, scriptsigs and the fee), verifying that buyer\'s
        // rawtx is indeed legitimate. The vendor then signs the rawtx and sends it to the buyer.
        // The vendor can decide to broadcast it himself.'

        const orderItem: resources.OrderItem = request.orderItem;
        const bid: resources.Bid = orderItem.Bid;
        const isMyListingItem = !_.isEmpty(orderItem.Bid.ListingItem.ListingItemTemplate);

        // rawtx is potentially the txid in case of ESCROW_LOCKED.
        let rawtx = this.getValueFromOrderItemObjects('rawtx', orderItem.OrderItemObjects);
        let pubkeys = this.getValueFromOrderItemObjects('pubkeys', orderItem.OrderItemObjects);
        pubkeys = JSON.parse(pubkeys);

        if (!bid || bid.action !== BidMessageType.MPA_ACCEPT
            || !orderItem || !orderItem.OrderItemObjects || orderItem.OrderItemObjects.length === 0
            || !rawtx || !pubkeys) {

            this.log.error('Not enough valid information to finalize escrow');
            throw new MessageException('Not enough valid information to finalize escrow');
        }

        switch (request.action) {
            case EscrowMessageType.MPA_LOCK:

                // to lock:
                // - you need to be the bidder/buyer,
                // - the Bid needs to be in MPA_ACCEPT state,
                // - bidDatas, rawtx and pubkeys need to have been collected

                if (isMyListingItem) {
                    throw new MessageException('Seller can\'t lock an Escrow.');
                }

                // rawtx = rawtx ? rawtx.dataValue as string : '';
                // pubkeys = pubkeys ? pubkeys.dataValue[0] === '[' ? JSON.parse(pubkeys.dataValue).sort() : pubkeys.dataValue : [];

                // Add Escrow address
                // TODO: Way to recover escrow address should we lose it
                // TODO: add this to OrderItemObjects?
                const escrowAddr = await this.coreRpcService.addMultiSigAddress(
                    2,
                    pubkeys.sort(),
                    '_escrow_' + orderItem.itemHash
                );
                // const escrowAddr = (await this.coreRpcService.call('addmultisigaddress', [2, pubkeys, '_escrow_' + request.item]));

                const signedForLock = await this.signRawTx(rawtx, true);

                // TODO: This requires user interaction, so should be elsewhere possibly?
                // TODO: Save TXID somewhere maybe??!
                const response = await this.coreRpcService.sendRawTransaction(signedForLock.hex);
                // return await this.coreRpcService.call('sendrawtransaction', [signed.hex]);

                this.log.debug('response:', JSON.stringify(response, null, 2));
                return response;

            case EscrowMessageType.MPA_RELEASE:

                // to seller to release:
                // - you need to be the seller,
                // - orderItem.status must be ESCROW_LOCKED,
                // - bidDatas/orderItemObjects, rawtx and pubkeys need to have been collected

                // we cant fetch the messageobjects like this, seller ListingItem can have ActionMessages coming from multiple bidders/buyers
                // const release = listing.ActionMessages.find(actionMessage => actionMessage.action === EscrowMessageType.MPA_RELEASE);

                if (OrderStatus.ESCROW_LOCKED === orderItem.status && isMyListingItem) {
                    // seller sends the first MPA_RELEASE, OrderStatus.ESCROW_LOCKED

                    // TODO: all keys should be enums
                    // TODO: naming something 'address' could mean any address and 'sellerAddress' means Profile.address of the seller

                    // TODO: earlier I think it was assumed that buyer releases the Escrow first,
                    // TODO: so should we actually have buyerReleaseAddress here?

                    const releaseAddress = this.getValueFromOrderItemObjects('address', orderItem.OrderItemObjects);
                    // let sellerAddress: string | resources.BidData | undefined = bidData.find(entry => entry.dataId === 'address');

                    if (!releaseAddress) {
                        this.log.error('Not enough valid information to finalize escrow');
                        throw new MessageException('Not enough valid information to finalize escrow');
                    }

                    const myAddress = await this.coreRpcService.getNewAddress(['_escrow_release'], false);
                    // const myAddress = await this.coreRpcService.call('getnewaddress', ['_escrow_release']);

                    // rawtx is the transaction id!
                    const realrawtx = await this.coreRpcService.getRawTransaction(rawtx);

                    const decoded = await this.coreRpcService.decodeRawTransaction(realrawtx);
                    // const decoded = await this.coreRpcService.call('decoderawtransaction', [rawtx]);

                    const txid = decoded.txid;
                    const value = decoded.vout[0].value - 0.0001; // TODO: Proper TX Fee

                    if (!txid) {
                        this.log.error(`Transaction with not found with txid: ${txid}.`);
                        throw new MessageException(`Transaction with not found with txid: ${txid}.`);
                    }

                    const txout = {};

                    // CRITICAL TODO: Use the right ratio's...
                    txout[myAddress] = value / 3;
                    txout[releaseAddress] = (value / 3) * 2;

                    this.log.debug('txout untruncated: ', txout);

                    // Kewde: simple truncation to 8
                    const truncateToDecimals = (int: number) => {
                        const calcDec = Math.pow(10, 8);
                        return Math.trunc(int * calcDec) / calcDec;
                    };

                    txout[myAddress] = truncateToDecimals(txout[myAddress]);
                    txout[releaseAddress] = truncateToDecimals(txout[releaseAddress]);
                    this.log.debug('final txout: ', txout);

                    const outputs: Output[] = [{txid, vout: 0}];  // TODO: Make sure this is the correct vout
                    this.log.debug('inputs: ', outputs);

                    rawtx = await this.coreRpcService.createRawTransaction(outputs, txout);
                    // rawtx = await this.coreRpcService.call('createrawtransaction', [
                    //    [{txid, vout: 0}], // TODO: Make sure this is the correct vout
                    //    txout
                    // ]);

                    // TODO: This requires user interaction, so should be elsewhere possibly?
                    const signedForReleaseBySeller = await this.signRawTx(rawtx, false);
                    return signedForReleaseBySeller.hex;

                } else if (OrderStatus.SHIPPING === orderItem.status && !isMyListingItem) {
                    // buyer sends the MPA_RELEASE, OrderStatus.SHIPPING

                    const signedForReleaseByBuyer = await this.signRawTx(rawtx, true);
                    return await this.coreRpcService.sendRawTransaction(signedForReleaseByBuyer.hex);

                    // return await this.coreRpcService.call('sendrawtransaction', [
                    //    (await signTx(release.MessageObjects.find(object => object.dataId === 'rawtx'), true)).hex
                    // ]);

                } else {
                    throw new MessageException('Something went wrong, MPA_RELEASE should not be sent at this point.');
                }

            /*
            // Ryno's code

            // const release = listing.ActionMessages.find(actionMessage => actionMessage.action === EscrowMessageType.MPA_RELEASE);

            // First check if someone has already called release...
            if (release) {
                // TODO: URGENT: Make sure transaction is valid...
                return await this.coreRpcService.call('sendrawtransaction', [
                    (await signTx(release.MessageObjects.find(object => object.dataId === 'rawtx'), true)).hex
                ]);
            } else {
                if (isMine) {
                    // TODO: Decide if seller can or can't initiate release..
                    // If we decide to go that route, the seller would need the buyers release address from the beginning...
                    throw new MessageException('Seller can\'t initiate escrow release.');

                }
                let sellerAddress: string | resources.BidData | undefined = bidData.find(entry => entry.dataId === 'address');
                if (!sellerAddress) {
                    this.log.error('Not enough valid information to finalize escrow');
                    throw new MessageException('Not enough valid information to finalize escrow');
                }

                sellerAddress = sellerAddress.dataValue as string;
                const myAddress = await this.coreRpcService.call('getnewaddress', ['_escrow_release']);
                const decoded = await this.coreRpcService.call('decoderawtransaction', [rawtx]);

                const txid = decoded.txid;
                const value = decoded.vout[0].value - 0.0001; // TODO: Proper TX Fee

                if (!txid) {
                    this.log.error(`Transaction with not found with txid: ${txid}.`);
                    throw new MessageException(`Transaction with not found with txid: ${txid}.`);
                }

                const txout = {};

                txout[myAddress] = value / 3;
                txout[sellerAddress] = (value / 3) * 2;

                rawtx = await this.coreRpcService.call('createrawtransaction', [
                    [{txid, vout: 0}], // TODO: Make sure this is the correct vout
                    txout
                ]);

                // TODO: This requires user interaction, so should be elsewhere possibly?
                return (await signTx(rawtx)).hex;
            }
            */
            default:
                throw new NotImplementedException();
        }
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.LockEscrowReceivedEvent, async (event) => {
            await this.processLockEscrowReceivedEvent(event);
        });
        this.eventEmitter.on(Events.ReleaseEscrowReceivedEvent, async (event) => {
            await this.processReleaseEscrowReceivedEvent(event);
        });
        this.eventEmitter.on(Events.RequestRefundEscrowReceivedEvent, async (event) => {
            await this.processRequestRefundEscrowReceivedEvent(event);
        });
        this.eventEmitter.on(Events.RefundEscrowReceivedEvent, async (event) => {
            await this.processRefundEscrowReceivedEvent(event);
        });
    }

    private async signRawTx(rawtx: string, shouldBeComplete?: boolean): Promise<any> {
        this.log.debug('signRawTx: signing rawtx and expecting it to be complete:', shouldBeComplete);
        // This requires user interaction, so should be elsewhere possibly?
        // TODO: Verify that the transaction has the correct values! Very important!!! TODO TODO TODO
        const signed = await this.coreRpcService.signRawTransaction(rawtx);

        const ignoreErrors = [
            'Unable to sign input, invalid stack size (possibly missing key)',
            'Operation not valid with the current stack size'
        ];

        if (!signed
            || signed.errors
            && (!shouldBeComplete && ignoreErrors.indexOf(signed.errors[0].error) === -1 || shouldBeComplete)) {
            // TODO: ^^ is this correct?!
            this.log.error('Error signing transaction' + signed ? ': ' + signed.errors[0].error : '');
            throw new MessageException('Error signing transaction' + signed ? ': ' + signed.error : '');
        }

        if (shouldBeComplete) {
            if (!signed.complete) {
                this.log.error('Transaction should be complete at this stage.', signed);
                throw new MessageException('Transaction should be complete at this stage');
            }
        } else if (signed.complete) {
            this.log.error('Transaction should not be complete at this stage, will not send insecure message');
            throw new MessageException('Transaction should not be complete at this stage, will not send insecure message');
        }

        return signed;
    }

    /**
     *
     * @param {string} key
     * @param {"resources".OrderItemObject[]} orderItemObjects
     * @returns {any}
     */
    private getValueFromOrderItemObjects(key: string, orderItemObjects: resources.OrderItemObject[]): any {
        const value = orderItemObjects.find(kv => kv.dataId === key);
        if (value) {
            return value.dataValue;
        } else {
            this.log.error('Missing OrderItemObject value for key: ' + key);
            throw new MessageException('Missing OrderItemObject value for key: ' + key);
        }
    }

    private async updateRawTxOrderItemObject(orderItemObjects: resources.OrderItemObject[], newRawtx: string): Promise<any> {
        const rawtxObject = orderItemObjects.find(kv => kv.dataId === 'rawtx');

        if (rawtxObject) {
            const updatedOrderItemObject = await this.orderItemObjectService.update(rawtxObject.id, {
                dataId: 'rawtx',
                dataValue: newRawtx
            } as OrderItemObjectUpdateRequest);
            return updatedOrderItemObject.toJSON();
        } else {
            throw new MessageException('OrderItemObject for rawtx not found!');
        }
    }

    private async updateOrderItemStatus(orderItem: resources.OrderItem, newOrderStatus: OrderStatus): Promise<resources.OrderItem> {

        const orderItemUpdateRequest = {
            itemHash: orderItem.itemHash,
            status: newOrderStatus
        } as OrderItemUpdateRequest;

        const updatedOrderItemModel = await this.orderItemService.update(orderItem.id, orderItemUpdateRequest);
        const updatedOrderItem: resources.OrderItem = updatedOrderItemModel.toJSON();
        this.log.debug('updatedOrderItem:', JSON.stringify(updatedOrderItem, null, 2));
        return updatedOrderItem;
    }
}
