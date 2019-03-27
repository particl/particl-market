// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { EventEmitter } from 'events';
import { EscrowService } from './EscrowService';
import { ListingItemService } from './ListingItemService';
import { MessageException } from '../exceptions/MessageException';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { OrderFactory } from '../factories/OrderFactory';
import { OrderService } from './OrderService';
import { SmsgService } from './SmsgService';
import { CoreRpcService } from './CoreRpcService';
import { EscrowFactory } from '../factories/EscrowFactory';
import { EscrowRequest } from '../requests/EscrowRequest';
import { OrderItemStatus } from '../enums/OrderItemStatus';
import { NotImplementedException } from '../exceptions/NotImplementedException';
import { OrderItemObjectService } from './OrderItemObjectService';
import { OrderItemObjectUpdateRequest } from '../requests/OrderItemObjectUpdateRequest';
import { EscrowMessage } from '../messages/EscrowMessage';
import { OrderItemUpdateRequest } from '../requests/OrderItemUpdateRequest';
import { OrderItemService } from './OrderItemService';
import { OrderSearchParams } from '../requests/OrderSearchParams';
import { LockedOutputService } from './LockedOutputService';
import { BidDataValue } from '../enums/BidDataValue';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SmsgMessageService } from './SmsgMessageService';
import { Output } from './BidActionService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { ompVersion } from 'omp-lib/dist/omp';

export class EscrowActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.EscrowService) private escrowService: EscrowService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.OrderService) private orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.OrderItemService) private orderItemService: OrderItemService,
        @inject(Types.Service) @named(Targets.Service.OrderItemObjectService) private orderItemObjectService: OrderItemObjectService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.LockedOutputService) private lockedOutputService: LockedOutputService,
        @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.EscrowFactory) private escrowFactory: EscrowFactory,
        @inject(Types.Factory) @named(Targets.Factory.OrderFactory) private orderFactory: OrderFactory,
        @inject(Types.Core) @named(Core.Events) private eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) private Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }

    /**
     * Send the lock message for the given OrderItem
     *
     * @param {EscrowRequest} escrowRequest
     * @returns {Promise<SmsgSendResponse>}
     */
    public async lock(escrowRequest: EscrowRequest): Promise<SmsgSendResponse> {

        this.validateEscrowRequest(escrowRequest);

        // unlock and remove the locked outputs from db before sending the rawtx
        const buyerSelectedOutputs = this.getValueFromOrderItemObjects(BidDataValue.BUYER_OUTPUTS, escrowRequest.orderItem.OrderItemObjects);
        await this.lockedOutputService.destroyLockedOutputs(buyerSelectedOutputs);
        const unlockSuccess = await this.lockedOutputService.unlockOutputs(buyerSelectedOutputs);

        if (unlockSuccess) {
            // generate rawtx and update it in the db
            const rawtx = await this.createRawTx(escrowRequest);
            const updatedRawTx = await this.updateRawTxOrderItemObject(escrowRequest.orderItem.OrderItemObjects, rawtx);

            await this.updateOrderItemStatus(escrowRequest.orderItem, OrderItemStatus.ESCROW_LOCKED);

            return await this.createAndSendMessage(escrowRequest, rawtx);

        } else {
            throw new MessageException('Failed to unlock the locked outputs.');
        }

    }


    /**
     *
     * @param {EscrowRequest} escrowRequest
     * @returns {Promise<SmsgSendResponse>}
     */
    public async refund(escrowRequest: EscrowRequest): Promise<SmsgSendResponse> {

        throw new NotImplementedException();

        // todo: refactor lock/refund/release since they're pretty much the same
        // todo: add @validate to EscrowLockRequest

    }

    /**
     * Seller sends EscrowReleaseMessage (MPA_RELEASE) to the Buyer, indicating that the item has been sent.
     * Buyer sends EscrowReleaseMessage (MPA_RELEASE) to the Seller, indicating that the sent item has been received.
     *
     * @param {EscrowRequest} escrowRequest
     * @returns {Promise<SmsgSendResponse>}
     */
    public async release(escrowRequest: EscrowRequest): Promise<SmsgSendResponse> {

        this.validateEscrowRequest(escrowRequest);

        const orderItem = escrowRequest.orderItem;
        const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;

        // generate rawtx and update it in the db
        const rawtx = await this.createRawTx(escrowRequest);
        const updatedRawTx = await this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);

        // update OrderItemStatus
        const isMyListingItem = !_.isEmpty(orderItem.Bid.ListingItem.ListingItemTemplate);
        const newOrderStatus = isMyListingItem ? OrderItemStatus.SHIPPING : OrderItemStatus.COMPLETE;
        await this.updateOrderItemStatus(orderItem, newOrderStatus);

        return await this.createAndSendMessage(escrowRequest, rawtx);
    }

    private validateEscrowRequest(escrowRequest: EscrowRequest): boolean {

        const orderItem = escrowRequest.orderItem;
        const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;

        if (_.isEmpty(orderItem)) {
            throw new MessageException('OrderItem not found!');
        }

        if (_.isEmpty(escrow)) {
            throw new MessageException('Escrow not found!');
        }

        // todo: add sanity checks and validate that values are correct and outputs unspent, etc


        return true;
    }

    private async createAndSendMessage(escrowRequest: EscrowRequest, rawtx: string): Promise<SmsgSendResponse> {

        // use escrowfactory to generate the message
        const escrowActionMessage = await this.escrowFactory.getMessage(escrowRequest, rawtx);

        const marketPlaceMessage = {
            version: ompVersion(),
            mpaction: escrowActionMessage
        } as MarketplaceMessage;

        const isMyListingItem = !_.isEmpty(escrowRequest.orderItem.Bid.ListingItem.ListingItemTemplate);
        const sendFromAddress = isMyListingItem ? escrowRequest.orderItem.Order.seller : escrowRequest.orderItem.Order.buyer;
        const sendToAddress = isMyListingItem ? escrowRequest.orderItem.Order.buyer : escrowRequest.orderItem.Order.seller;

        return await this.smsgService.smsgSend(sendFromAddress, sendToAddress, marketPlaceMessage, false);
    }

    /**
     * find Order, using buyer, seller and Order.OrderItem.itemHash
     *
     * @param {string} listingItemHash
     * @param {string} buyerAddress
     * @param {string} sellerAddress
     * @returns {Promise<module:resources.Order>}
     */
    private async findOrder(listingItemHash: string, buyerAddress: string, sellerAddress: string): Promise<resources.Order> {

        const orderSearchParams = {
            listingItemHash,
            buyerAddress,
            sellerAddress
        } as OrderSearchParams;

        const ordersModel = await this.orderService.search(orderSearchParams);
        const orders = ordersModel.toJSON();

        if (orders.length === 0) {
            this.log.error('Order not found for EscrowMessage.');
            throw new MessageException('Order not found for EscrowMessage.');
        }

        if (orders.length > 1) {
            this.log.error('Multiple Orders found for EscrowMessage, this should not happen.');
            throw new MessageException('Multiple Orders found for EscrowMessage.');
        }
        return orders[0];
    }

    /**
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Order>}
     */
    private async processLockEscrowReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        // TODO: EscrowMessage should contain Order.hash to identify the item in case there are two different Orders
        // with the same item for same buyer. Currently, buyer can only bid once for an item, but this might not be the case always.

        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        const escrowMessage = message.mpaction as EscrowMessage;
        const listingItemHash = escrowMessage.item;

        // find the ListingItem
        return await this.listingItemService.findOneByHash(escrowMessage.item)
            .then(async listingItemModel => {

                const listingItem = listingItemModel.toJSON();

                const seller = listingItem.seller;
                const buyer = listingItem.seller === event.smsgMessage.from ? event.smsgMessage.to : event.smsgMessage.from;

                // find the Order, using buyer, seller and Order.OrderItem.itemHash
                const order: resources.Order = await this.findOrder(listingItemHash, buyer, seller);
                const orderItem = _.find(order.OrderItems, (o: resources.OrderItem) => {
                    return o.itemHash === listingItemHash;
                });

                if (orderItem) {

                    // update rawtx
                    const rawtx = escrowMessage.escrow.rawtx;
                    const updatedRawTx = await this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);
                    this.log.info('processLock(), rawtx:', JSON.stringify(updatedRawTx, null, 2));

                    const updatedOrderItem = await this.updateOrderItemStatus(orderItem, OrderItemStatus.ESCROW_LOCKED);

                    // remove the sellers locked outputs
                    const selectedOutputs = this.getValueFromOrderItemObjects(BidDataValue.SELLER_OUTPUTS, orderItem.OrderItemObjects);
                    await this.lockedOutputService.destroyLockedOutputs(selectedOutputs);

                    return SmsgMessageStatus.PROCESSED;

                } else {
                    this.log.error('OrderItem not found for EscrowMessage.');
                    throw new MessageException('OrderItem not found for EscrowMessage.');
                }

            })
            .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus.WAITING;
            });

    }

    private async processReleaseEscrowReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const message = event.marketplaceMessage;
        if (!message.mpaction) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        const escrowMessage = message.mpaction as EscrowMessage;
        const listingItemHash = escrowMessage.item;

        // find the ListingItem
        return await this.listingItemService.findOneByHash(escrowMessage.item)
            .then(async listingItemModel => {

                const listingItem: resources.ListingItem = listingItemModel.toJSON();

                const seller = listingItem.seller;
                const buyer = listingItem.seller === event.smsgMessage.from ? event.smsgMessage.to : event.smsgMessage.from;
                const isMyListingItem = !!listingItem.ListingItemTemplate;

                // find the Order, using buyer, seller and Order.OrderItem.itemHash
                const order: resources.Order = await this.findOrder(listingItemHash, buyer, seller);
                const orderItem = _.find(order.OrderItems, (o: resources.OrderItem) => {
                    return o.itemHash === listingItemHash;
                });

                if (orderItem) {

                    // update rawtx
                    const rawtx = escrowMessage.escrow.rawtx;
                    const updatedRawTx = await this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);


                    const newOrderStatus = isMyListingItem ? OrderItemStatus.COMPLETE : OrderItemStatus.SHIPPING;
                    const updatedOrderItem = await this.updateOrderItemStatus(orderItem, newOrderStatus);

                    return SmsgMessageStatus.PROCESSED;

                } else {
                    this.log.error('OrderItem not found for EscrowMessage.');
                    throw new MessageException('OrderItem not found for EscrowMessage.');
                }
            })
            .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus.WAITING;
            });

    }

    private async processRequestRefundEscrowReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const message = event.marketplaceMessage;
        const escrowMessage = message.mpaction as EscrowMessage;
        if (!escrowMessage || !escrowMessage.item) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        // find the ListingItem
        return await this.listingItemService.findOneByHash(escrowMessage.item)
            .then(async listingItemModel => {
                const listingItem = listingItemModel.toJSON();

                // todo: update order
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus.WAITING;
            });
    }

    private async processRefundEscrowReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const message = event.marketplaceMessage;
        const escrowMessage = message.mpaction as EscrowMessage;
        if (!escrowMessage || !escrowMessage.item) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        // find the ListingItem
        return await this.listingItemService.findOneByHash(escrowMessage.item)
            .then(async listingItemModel => {
                const listingItem = listingItemModel.toJSON();

                // todo: update order
                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus.WAITING;
            });
    }

    /**
     * Creates rawtx based on params
     *
     * @param request
     * @param escrow
     * @returns {string}
     */
    private async createRawTx(request: EscrowRequest): Promise<string> {

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
        const isMyListingItem = !_.isEmpty(bid.ListingItem.ListingItemTemplate);

        // this.log.debug('createRawTx(), orderItem:', JSON.stringify(orderItem, null, 2));

        // rawtx is potentially the txid in case of ESCROW_LOCKED.
        let rawtx = this.getValueFromOrderItemObjects(BidDataValue.RAW_TX, orderItem.OrderItemObjects);
        const buyerEscrowPubAddressPublicKey = this.getValueFromOrderItemObjects(BidDataValue.BUYER_PUBKEY, orderItem.OrderItemObjects);
        const sellerEscrowPubAddressPublicKey = this.getValueFromOrderItemObjects(BidDataValue.SELLER_PUBKEY, orderItem.OrderItemObjects);
        const pubkeys = [sellerEscrowPubAddressPublicKey, buyerEscrowPubAddressPublicKey].sort();
        // todo: does the order of the pubkeys matter?

        this.log.debug('createRawTx(), rawtx:', rawtx);
        this.log.debug('createRawTx(), pubkeys:', pubkeys);

        if (!bid || bid.action !== MPAction.MPA_ACCEPT
            || !orderItem || !orderItem.OrderItemObjects || orderItem.OrderItemObjects.length === 0
            || !rawtx || !pubkeys) {

            this.log.error('Not enough valid information to finalize escrow');
            throw new MessageException('Not enough valid information to finalize escrow');
        }

        this.log.debug('createRawTx(), request.action:', request.action);

        switch (request.action) {

            case MPAction.MPA_LOCK:

                if (isMyListingItem) {
                    throw new MessageException('Seller can\'t lock an Escrow.');
                }

                // Add Escrow address
                // TODO: Way to recover escrow address should we lose it
                const escrowMultisigAddress = await this.coreRpcService.addMultiSigAddress(
                    2,
                    pubkeys,
                    '_escrow_' + orderItem.itemHash
                );
                this.log.debug('createRawTx(), escrowMultisigAddress:', JSON.stringify(escrowMultisigAddress, null, 2));

                // validate the escrow amounts
                const decodedTx = await this.coreRpcService.decodeRawTransaction(rawtx);
                this.log.debug('createRawTx(), decoded:', JSON.stringify(decodedTx, null, 2));
                // TODO: validation

                // buyer signs the escrow tx, which should complete
                const signedForLock = await this.signRawTx(rawtx, true);
                this.log.debug('createRawTx(), signedForLock:', JSON.stringify(signedForLock, null, 2));

                // TODO: This requires user interaction, so should be elsewhere possibly?
                // TODO: Save TXID somewhere maybe??!
                const response = await this.coreRpcService.sendRawTransaction(signedForLock); // .hex);

                this.log.debug('createRawTx(), response:', JSON.stringify(response, null, 2));
                return response;

            case MPAction.MPA_RELEASE:

                if (OrderItemStatus.ESCROW_LOCKED === orderItem.status && isMyListingItem) {
                    // seller sends the first MPA_RELEASE, OrderItemStatus.ESCROW_LOCKED
                    // this.log.debug('createRawTx(), orderItem:', JSON.stringify(orderItem, null, 2));

                    const buyerReleaseAddress = this.getValueFromOrderItemObjects(BidDataValue.BUYER_RELEASE_ADDRESS, orderItem.OrderItemObjects);
                    this.log.debug('createRawTx(), buyerReleaseAddress:', buyerReleaseAddress);

                    if (!buyerReleaseAddress) {
                        this.log.error('Not enough valid information to finalize escrow');
                        throw new MessageException('Not enough valid information to finalize escrow');
                    }

                    const sellerReleaseAddress = await this.coreRpcService.getNewAddress(['_escrow_release'], false);
                    this.log.debug('createRawTx(), sellerReleaseAddress:', sellerReleaseAddress);

                    // rawtx is the transaction id!
                    const realrawtx = await this.coreRpcService.getRawTransaction(rawtx);
                    const decoded = await this.coreRpcService.decodeRawTransaction(realrawtx);
                    this.log.debug('createRawTx(), decoded:', JSON.stringify(decoded, null, 2));

                    const txid = decoded.txid;
                    const value = decoded.vout[0].value - 0.0001; // TODO: Proper TX Fee

                    if (!txid) {
                        this.log.error(`Transaction with not found with txid: ${txid}.`);
                        throw new MessageException(`Transaction with not found with txid: ${txid}.`);
                    }

                    const txout = {};

                    // CRITICAL TODO: Use the right ratio's...

                    // seller gets his escrow amount + buyer payment back
                    // buyer gets the escrow amount back
                    txout[sellerReleaseAddress] = +(value / 3 * 2).toFixed(8);
                    txout[buyerReleaseAddress] = +(value / 3).toFixed(8);

                    // TODO: Make sure this is the correct vout !!!
                    // TODO: loop through the vouts and check the value, but what if theres multiple outputs with same value?
                    const txInputs: Output[] = [{txid, vout: 0}];
                    this.log.debug('===============================================================================');
                    this.log.debug('createRawTx(), txInputs:', JSON.stringify(txInputs, null, 2));
                    this.log.debug('createRawTx(), txout: ', JSON.stringify(txout, null, 2));

                    rawtx = await this.coreRpcService.createRawTransaction(txInputs, txout);
                    const signed = await this.signRawTx(rawtx, false);

                    this.log.debug('createRawTx(), rawtx: ', JSON.stringify(rawtx, null, 2));
                    this.log.debug('createRawTx(), signed: ', JSON.stringify(signed, null, 2));

                    return signed.hex;

                } else if (OrderItemStatus.SHIPPING === orderItem.status && !isMyListingItem) {
                    // buyer sends the MPA_RELEASE, OrderItemStatus.SHIPPING

                    const completeRawTx = await this.signRawTx(rawtx, true);
                    this.log.debug('createRawTx(), completeRawTx: ', JSON.stringify(completeRawTx, null, 2));

                    const txid =  await this.coreRpcService.sendRawTransaction(completeRawTx);
                    this.log.debug('createRawTx(), response:', JSON.stringify(txid, null, 2));
                    return txid;

                } else {
                    throw new MessageException('Something went wrong, MPA_RELEASE should not be sent at this point.');
                }

            default:
                throw new NotImplementedException();
        }
    }

    /**
     * signs rawtx and ignores errors in case tx shouldnt be complete yet.
     *
     * @param {string} rawtx
     * @param {boolean} shouldBeComplete
     * @returns {Promise<any>}
     */
    private async signRawTx(rawtx: string, shouldBeComplete: boolean): Promise<any> {

        this.log.debug('signRawTx(): signing rawtx, shouldBeComplete:', shouldBeComplete);

        // This requires user interaction, so should be elsewhere possibly?
        // TODO: Verify that the transaction has the correct values! Very important!!! TODO TODO TODO

        // 0.16.x
        // const signed = await this.coreRpcService.signRawTransaction(rawtx);
        // 0.17++
        const signed = await this.coreRpcService.signRawTransactionWithWallet(rawtx);
        this.log.info('===========================================================================');
        this.log.info('signed: ', JSON.stringify(signed, null, 2));
        this.log.info('===========================================================================');

        if (shouldBeComplete) {
            // rawtx_complete =  buyer.combinerawtransaction(rawtx_with_buyer_sig, rawtx_with_seller_sig)
            const completeRawTx = await this.coreRpcService.combineRawTransaction([signed.hex, rawtx]);
            this.log.info('===========================================================================');
            this.log.info('completeRawTx: ', JSON.stringify(completeRawTx, null, 2));
            this.log.info('===========================================================================');

            // const decodedTx = await this.coreRpcService.decodeRawTransaction(completeRawTx);
            // this.log.debug('createRawTx(), completeRawTx decoded:', JSON.stringify(decodedTx, null, 2));

            return completeRawTx;

        } else {

            const ignoreErrors = [
                'Unable to sign input, invalid stack size (possibly missing key)',
                'Operation not valid with the current stack size',
                'Signature must be zero for failed CHECK(MULTI)SIG operation'
            ];

            if (!signed
                || signed.errors
                && (!shouldBeComplete && ignoreErrors.indexOf(signed.errors[0].error) === -1)) {
                this.log.error('Error signing transaction' + signed.errors ? ': ' + signed.errors[0].error : '');
                this.log.error('signed: ', JSON.stringify(signed, null, 2));
                throw new MessageException('Error signing transaction' + signed.errors ? ': ' + signed.error : '');
            }

            this.log.debug('signRawTx(): signed:', JSON.stringify(signed, null, 2));
            return signed;
        }

/*
        if (shouldBeComplete) {
            if (!signed.complete) {
                this.log.error('Transaction should be complete at this stage.', JSON.stringify(signed, null, 2));
                throw new MessageException('Transaction should be complete at this stage');
            }
        } else if (signed.complete) {
            this.log.error('Transaction should not be complete at this stage, will not send insecure message');
            throw new MessageException('Transaction should not be complete at this stage, will not send insecure message');
        }

        this.log.debug('signRawTx(): signed:', JSON.stringify(signed, null, 2));

        return signed;
*/
    }

    /**
     *
     * @param {string} key
     * @param {module:resources.OrderItemObject[]} orderItemObjects
     * @returns {any}
     */
    private getValueFromOrderItemObjects(key: string, orderItemObjects: resources.OrderItemObject[]): any {
        const value = orderItemObjects.find(kv => kv.dataId === key);
        if (value) {
            return value.dataValue[0] === '[' ? JSON.parse(value.dataValue) : value.dataValue;
        } else {
            this.log.error('Missing OrderItemObject value for key: ' + key);
            throw new MessageException('Missing OrderItemObject value for key: ' + key);
        }
    }

    /**
     * updates rawtx
     *
     * @param {module:resources.OrderItemObject[]} orderItemObjects
     * @param {string} newRawtx
     * @returns {Promise<any>}
     */
    private async updateRawTxOrderItemObject(orderItemObjects: resources.OrderItemObject[], newRawtx: string): Promise<any> {
        const rawtxObject = orderItemObjects.find(kv => kv.dataId === 'rawtx');

        if (rawtxObject) {
            const updatedOrderItemObject = await this.orderItemObjectService.update(rawtxObject.id, {
                dataId: BidDataValue.RAW_TX.toString(),
                dataValue: newRawtx
            } as OrderItemObjectUpdateRequest);
            return updatedOrderItemObject.toJSON();
        } else {
            this.log.error('OrderItemObject for rawtx not found!');
            throw new MessageException('OrderItemObject for rawtx not found!');
        }
    }

    /**
     * updates orderitems status
     *
     * @param {module:resources.OrderItem} orderItem
     * @param {OrderItemStatus} newOrderStatus
     * @returns {Promise<module:resources.OrderItem>}
     */
    private async updateOrderItemStatus(orderItem: resources.OrderItem, newOrderStatus: OrderItemStatus): Promise<resources.OrderItem> {

        const orderItemUpdateRequest = {
            itemHash: orderItem.itemHash,
            status: newOrderStatus
        } as OrderItemUpdateRequest;

        const updatedOrderItemModel = await this.orderItemService.update(orderItem.id, orderItemUpdateRequest);
        const updatedOrderItem: resources.OrderItem = updatedOrderItemModel.toJSON();
        // this.log.debug('updatedOrderItem:', JSON.stringify(updatedOrderItem, null, 2));
        return updatedOrderItem;
    }

    private configureEventListeners(): void {
        this.log.info('Configuring EventListeners ');

        this.eventEmitter.on(Events.LockEscrowReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processLockEscrowReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('ERROR: EscrowLockMessage processing failed.', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });
        });
        this.eventEmitter.on(Events.ReleaseEscrowReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processReleaseEscrowReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('ERROR: EscrowReleaseMessage processing failed.', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });
        });
        this.eventEmitter.on(Events.RefundEscrowReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processRefundEscrowReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('ERROR: EscrowRefundMessage processing failed.', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });
        });
    }

}
