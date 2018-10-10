"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const events_1 = require("events");
const ActionMessageService_1 = require("./ActionMessageService");
const EscrowService_1 = require("./EscrowService");
const ListingItemService_1 = require("./ListingItemService");
const MessageException_1 = require("../exceptions/MessageException");
const _ = require("lodash");
const OrderFactory_1 = require("../factories/OrderFactory");
const OrderService_1 = require("./OrderService");
const SmsgService_1 = require("./SmsgService");
const CoreRpcService_1 = require("./CoreRpcService");
const EscrowFactory_1 = require("../factories/EscrowFactory");
const EscrowMessageType_1 = require("../enums/EscrowMessageType");
const BidMessageType_1 = require("../enums/BidMessageType");
const OrderStatus_1 = require("../enums/OrderStatus");
const NotImplementedException_1 = require("../exceptions/NotImplementedException");
const OrderItemObjectService_1 = require("./OrderItemObjectService");
const OrderItemService_1 = require("./OrderItemService");
const LockedOutputService_1 = require("./LockedOutputService");
const BidDataValue_1 = require("../enums/BidDataValue");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
const SmsgMessageService_1 = require("./SmsgMessageService");
let EscrowActionService = class EscrowActionService {
    constructor(actionMessageService, escrowService, listingItemService, smsgService, orderService, orderItemService, orderItemObjectService, coreRpcService, lockedOutputService, smsgMessageService, escrowFactory, orderFactory, eventEmitter, Logger) {
        this.actionMessageService = actionMessageService;
        this.escrowService = escrowService;
        this.listingItemService = listingItemService;
        this.smsgService = smsgService;
        this.orderService = orderService;
        this.orderItemService = orderItemService;
        this.orderItemObjectService = orderItemObjectService;
        this.coreRpcService = coreRpcService;
        this.lockedOutputService = lockedOutputService;
        this.smsgMessageService = smsgMessageService;
        this.escrowFactory = escrowFactory;
        this.orderFactory = orderFactory;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }
    /**
     * Send the lock message for the given OrderItem
     *
     * @param {EscrowRequest} escrowRequest
     * @returns {Promise<SmsgSendResponse>}
     */
    lock(escrowRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.validateEscrowRequest(escrowRequest);
            // unlock and remove the locked outputs from db before sending the rawtx
            const buyerSelectedOutputs = this.getValueFromOrderItemObjects(BidDataValue_1.BidDataValue.BUYER_OUTPUTS, escrowRequest.orderItem.OrderItemObjects);
            yield this.lockedOutputService.destroyLockedOutputs(buyerSelectedOutputs);
            const unlockSuccess = yield this.lockedOutputService.unlockOutputs(buyerSelectedOutputs);
            if (unlockSuccess) {
                // generate rawtx and update it in the db
                const rawtx = yield this.createRawTx(escrowRequest);
                const updatedRawTx = yield this.updateRawTxOrderItemObject(escrowRequest.orderItem.OrderItemObjects, rawtx);
                yield this.updateOrderItemStatus(escrowRequest.orderItem, OrderStatus_1.OrderStatus.ESCROW_LOCKED);
                return yield this.createAndSendMessage(escrowRequest, rawtx);
            }
            else {
                throw new MessageException_1.MessageException('Failed to unlock the locked outputs.');
            }
        });
    }
    /**
     *
     * @param {EscrowRequest} escrowRequest
     * @returns {Promise<SmsgSendResponse>}
     */
    refund(escrowRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            throw new NotImplementedException_1.NotImplementedException();
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
        });
    }
    /**
     * Seller sends EscrowReleaseMessage (MPA_RELEASE) to the Buyer, indicating that the item has been sent.
     * Buyer sends EscrowReleaseMessage (MPA_RELEASE) to the Seller, indicating that the sent item has been received.
     *
     * @param {EscrowRequest} escrowRequest
     * @returns {Promise<SmsgSendResponse>}
     */
    release(escrowRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.validateEscrowRequest(escrowRequest);
            const orderItem = escrowRequest.orderItem;
            const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;
            // generate rawtx and update it in the db
            const rawtx = yield this.createRawTx(escrowRequest);
            const updatedRawTx = yield this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);
            // update OrderStatus
            const isMyListingItem = !_.isEmpty(orderItem.Bid.ListingItem.ListingItemTemplate);
            const newOrderStatus = isMyListingItem ? OrderStatus_1.OrderStatus.SHIPPING : OrderStatus_1.OrderStatus.COMPLETE;
            yield this.updateOrderItemStatus(orderItem, newOrderStatus);
            return yield this.createAndSendMessage(escrowRequest, rawtx);
        });
    }
    validateEscrowRequest(escrowRequest) {
        const orderItem = escrowRequest.orderItem;
        const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;
        if (_.isEmpty(orderItem)) {
            throw new MessageException_1.MessageException('OrderItem not found!');
        }
        if (_.isEmpty(escrow)) {
            throw new MessageException_1.MessageException('Escrow not found!');
        }
        // todo: add sanity checks and validate that values are correct and outputs unspent, etc
        return true;
    }
    createAndSendMessage(escrowRequest, rawtx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // use escrowfactory to generate the message
            const escrowActionMessage = yield this.escrowFactory.getMessage(escrowRequest, rawtx);
            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: escrowActionMessage
            };
            const isMyListingItem = !_.isEmpty(escrowRequest.orderItem.Bid.ListingItem.ListingItemTemplate);
            const sendFromAddress = isMyListingItem ? escrowRequest.orderItem.Order.seller : escrowRequest.orderItem.Order.buyer;
            const sendToAddress = isMyListingItem ? escrowRequest.orderItem.Order.buyer : escrowRequest.orderItem.Order.seller;
            return yield this.smsgService.smsgSend(sendFromAddress, sendToAddress, marketPlaceMessage, false);
        });
    }
    /**
     * find Order, using buyer, seller and Order.OrderItem.itemHash
     *
     * @param {string} listingItemHash
     * @param {string} buyerAddress
     * @param {string} sellerAddress
     * @returns {Promise<module:resources.Order>}
     */
    findOrder(listingItemHash, buyerAddress, sellerAddress) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const orderSearchParams = {
                listingItemHash,
                buyerAddress,
                sellerAddress
            };
            const ordersModel = yield this.orderService.search(orderSearchParams);
            const orders = ordersModel.toJSON();
            if (orders.length === 0) {
                this.log.error('Order not found for EscrowMessage.');
                throw new MessageException_1.MessageException('Order not found for EscrowMessage.');
            }
            if (orders.length > 1) {
                this.log.error('Multiple Orders found for EscrowMessage, this should not happen.');
                throw new MessageException_1.MessageException('Multiple Orders found for EscrowMessage.');
            }
            return orders[0];
        });
    }
    /**
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Order>}
     */
    processLockEscrowReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: EscrowMessage should contain Order.hash to identify the item in case there are two different Orders
            // with the same item for same buyer. Currently, buyer can only bid once for an item, but this might not be the case always.
            const message = event.marketplaceMessage;
            if (!message.mpaction) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            const escrowMessage = message.mpaction;
            const listingItemHash = escrowMessage.item;
            // find the ListingItem
            return yield this.listingItemService.findOneByHash(escrowMessage.item)
                .then((listingItemModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const listingItem = listingItemModel.toJSON();
                const seller = listingItem.seller;
                const buyer = listingItem.seller === event.smsgMessage.from ? event.smsgMessage.to : event.smsgMessage.from;
                // save ActionMessage
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                // find the Order, using buyer, seller and Order.OrderItem.itemHash
                const order = yield this.findOrder(listingItemHash, buyer, seller);
                const orderItem = _.find(order.OrderItems, (o) => {
                    return o.itemHash === listingItemHash;
                });
                if (orderItem) {
                    // update rawtx
                    const rawtx = escrowMessage.escrow.rawtx;
                    const updatedRawTx = yield this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);
                    this.log.info('processLock(), rawtx:', JSON.stringify(updatedRawTx, null, 2));
                    const updatedOrderItem = yield this.updateOrderItemStatus(orderItem, OrderStatus_1.OrderStatus.ESCROW_LOCKED);
                    // remove the sellers locked outputs
                    const selectedOutputs = this.getValueFromOrderItemObjects(BidDataValue_1.BidDataValue.SELLER_OUTPUTS, orderItem.OrderItemObjects);
                    yield this.lockedOutputService.destroyLockedOutputs(selectedOutputs);
                    return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
                }
                else {
                    this.log.error('OrderItem not found for EscrowMessage.');
                    throw new MessageException_1.MessageException('OrderItem not found for EscrowMessage.');
                }
            }))
                .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
            });
        });
    }
    processReleaseEscrowReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const message = event.marketplaceMessage;
            if (!message.mpaction) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            const escrowMessage = message.mpaction;
            const listingItemHash = escrowMessage.item;
            // find the ListingItem
            return yield this.listingItemService.findOneByHash(escrowMessage.item)
                .then((listingItemModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const listingItem = listingItemModel.toJSON();
                const seller = listingItem.seller;
                const buyer = listingItem.seller === event.smsgMessage.from ? event.smsgMessage.to : event.smsgMessage.from;
                const isMyListingItem = !!listingItem.ListingItemTemplate;
                // save ActionMessage
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                // find the Order, using buyer, seller and Order.OrderItem.itemHash
                const order = yield this.findOrder(listingItemHash, buyer, seller);
                const orderItem = _.find(order.OrderItems, (o) => {
                    return o.itemHash === listingItemHash;
                });
                if (orderItem) {
                    // update rawtx
                    const rawtx = escrowMessage.escrow.rawtx;
                    const updatedRawTx = yield this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);
                    const newOrderStatus = isMyListingItem ? OrderStatus_1.OrderStatus.COMPLETE : OrderStatus_1.OrderStatus.SHIPPING;
                    const updatedOrderItem = yield this.updateOrderItemStatus(orderItem, newOrderStatus);
                    return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
                }
                else {
                    this.log.error('OrderItem not found for EscrowMessage.');
                    throw new MessageException_1.MessageException('OrderItem not found for EscrowMessage.');
                }
            }))
                .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
            });
        });
    }
    processRequestRefundEscrowReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the ListingItem
            const message = event.marketplaceMessage;
            if (!message.mpaction || !message.mpaction.item) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            // find the ListingItem
            return yield this.listingItemService.findOneByHash(message.mpaction.item)
                .then((listingItemModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const listingItem = listingItemModel.toJSON();
                // first save it
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                // todo: update order
                return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
            }))
                .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
            });
        });
    }
    processRefundEscrowReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the ListingItem
            const message = event.marketplaceMessage;
            if (!message.mpaction || !message.mpaction.item) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            // find the ListingItem
            return yield this.listingItemService.findOneByHash(message.mpaction.item)
                .then((listingItemModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const listingItem = listingItemModel.toJSON();
                // first save it
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                // todo: update order
                return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
            }))
                .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
            });
        });
    }
    /**
     * Creates rawtx based on params
     *
     * @param request
     * @param escrow
     * @returns {string}
     */
    createRawTx(request) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
            const orderItem = request.orderItem;
            const bid = orderItem.Bid;
            const isMyListingItem = !_.isEmpty(bid.ListingItem.ListingItemTemplate);
            // this.log.debug('createRawTx(), orderItem:', JSON.stringify(orderItem, null, 2));
            // rawtx is potentially the txid in case of ESCROW_LOCKED.
            let rawtx = this.getValueFromOrderItemObjects(BidDataValue_1.BidDataValue.RAW_TX, orderItem.OrderItemObjects);
            const buyerEscrowPubAddressPublicKey = this.getValueFromOrderItemObjects(BidDataValue_1.BidDataValue.BUYER_PUBKEY, orderItem.OrderItemObjects);
            const sellerEscrowPubAddressPublicKey = this.getValueFromOrderItemObjects(BidDataValue_1.BidDataValue.SELLER_PUBKEY, orderItem.OrderItemObjects);
            const pubkeys = [sellerEscrowPubAddressPublicKey, buyerEscrowPubAddressPublicKey].sort();
            // todo: does the order of the pubkeys matter?
            this.log.debug('createRawTx(), rawtx:', rawtx);
            this.log.debug('createRawTx(), pubkeys:', pubkeys);
            if (!bid || bid.action !== BidMessageType_1.BidMessageType.MPA_ACCEPT
                || !orderItem || !orderItem.OrderItemObjects || orderItem.OrderItemObjects.length === 0
                || !rawtx || !pubkeys) {
                this.log.error('Not enough valid information to finalize escrow');
                throw new MessageException_1.MessageException('Not enough valid information to finalize escrow');
            }
            this.log.debug('createRawTx(), request.action:', request.action);
            switch (request.action) {
                case EscrowMessageType_1.EscrowMessageType.MPA_LOCK:
                    if (isMyListingItem) {
                        throw new MessageException_1.MessageException('Seller can\'t lock an Escrow.');
                    }
                    // Add Escrow address
                    // TODO: Way to recover escrow address should we lose it
                    const escrowMultisigAddress = yield this.coreRpcService.addMultiSigAddress(2, pubkeys, '_escrow_' + orderItem.itemHash);
                    this.log.debug('createRawTx(), escrowMultisigAddress:', JSON.stringify(escrowMultisigAddress, null, 2));
                    // validate the escrow amounts
                    const decodedTx = yield this.coreRpcService.decodeRawTransaction(rawtx);
                    this.log.debug('createRawTx(), decoded:', JSON.stringify(decodedTx, null, 2));
                    // TODO: validation
                    // buyer signs the escrow tx, which should complete
                    const signedForLock = yield this.signRawTx(rawtx, true);
                    this.log.debug('createRawTx(), signedForLock:', JSON.stringify(signedForLock, null, 2));
                    // TODO: This requires user interaction, so should be elsewhere possibly?
                    // TODO: Save TXID somewhere maybe??!
                    const response = yield this.coreRpcService.sendRawTransaction(signedForLock); // .hex);
                    this.log.debug('createRawTx(), response:', JSON.stringify(response, null, 2));
                    return response;
                case EscrowMessageType_1.EscrowMessageType.MPA_RELEASE:
                    if (OrderStatus_1.OrderStatus.ESCROW_LOCKED === orderItem.status && isMyListingItem) {
                        // seller sends the first MPA_RELEASE, OrderStatus.ESCROW_LOCKED
                        // this.log.debug('createRawTx(), orderItem:', JSON.stringify(orderItem, null, 2));
                        const buyerReleaseAddress = this.getValueFromOrderItemObjects(BidDataValue_1.BidDataValue.BUYER_RELEASE_ADDRESS, orderItem.OrderItemObjects);
                        this.log.debug('createRawTx(), buyerReleaseAddress:', buyerReleaseAddress);
                        if (!buyerReleaseAddress) {
                            this.log.error('Not enough valid information to finalize escrow');
                            throw new MessageException_1.MessageException('Not enough valid information to finalize escrow');
                        }
                        const sellerReleaseAddress = yield this.coreRpcService.getNewAddress(['_escrow_release'], false);
                        this.log.debug('createRawTx(), sellerReleaseAddress:', sellerReleaseAddress);
                        // rawtx is the transaction id!
                        const realrawtx = yield this.coreRpcService.getRawTransaction(rawtx);
                        const decoded = yield this.coreRpcService.decodeRawTransaction(realrawtx);
                        this.log.debug('createRawTx(), decoded:', JSON.stringify(decoded, null, 2));
                        const txid = decoded.txid;
                        const value = decoded.vout[0].value - 0.0001; // TODO: Proper TX Fee
                        if (!txid) {
                            this.log.error(`Transaction with not found with txid: ${txid}.`);
                            throw new MessageException_1.MessageException(`Transaction with not found with txid: ${txid}.`);
                        }
                        const txout = {};
                        // CRITICAL TODO: Use the right ratio's...
                        // seller gets his escrow amount + buyer payment back
                        // buyer gets the escrow amount back
                        txout[sellerReleaseAddress] = +(value / 3 * 2).toFixed(8);
                        txout[buyerReleaseAddress] = +(value / 3).toFixed(8);
                        // TODO: Make sure this is the correct vout !!!
                        // TODO: loop through the vouts and check the value, but what if theres multiple outputs with same value?
                        const txInputs = [{ txid, vout: 0 }];
                        this.log.debug('===============================================================================');
                        this.log.debug('createRawTx(), txInputs:', JSON.stringify(txInputs, null, 2));
                        this.log.debug('createRawTx(), txout: ', JSON.stringify(txout, null, 2));
                        rawtx = yield this.coreRpcService.createRawTransaction(txInputs, txout);
                        const signed = yield this.signRawTx(rawtx, false);
                        this.log.debug('createRawTx(), rawtx: ', JSON.stringify(rawtx, null, 2));
                        this.log.debug('createRawTx(), signed: ', JSON.stringify(signed, null, 2));
                        return signed.hex;
                    }
                    else if (OrderStatus_1.OrderStatus.SHIPPING === orderItem.status && !isMyListingItem) {
                        // buyer sends the MPA_RELEASE, OrderStatus.SHIPPING
                        const completeRawTx = yield this.signRawTx(rawtx, true);
                        this.log.debug('createRawTx(), completeRawTx: ', JSON.stringify(completeRawTx, null, 2));
                        const txid = yield this.coreRpcService.sendRawTransaction(completeRawTx);
                        this.log.debug('createRawTx(), response:', JSON.stringify(txid, null, 2));
                        return txid;
                    }
                    else {
                        throw new MessageException_1.MessageException('Something went wrong, MPA_RELEASE should not be sent at this point.');
                    }
                default:
                    throw new NotImplementedException_1.NotImplementedException();
            }
        });
    }
    /**
     * signs rawtx and ignores errors in case tx shouldnt be complete yet.
     *
     * @param {string} rawtx
     * @param {boolean} shouldBeComplete
     * @returns {Promise<any>}
     */
    signRawTx(rawtx, shouldBeComplete) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('signRawTx(): signing rawtx, shouldBeComplete:', shouldBeComplete);
            // This requires user interaction, so should be elsewhere possibly?
            // TODO: Verify that the transaction has the correct values! Very important!!! TODO TODO TODO
            // 0.16.x
            // const signed = await this.coreRpcService.signRawTransaction(rawtx);
            // 0.17++
            const signed = yield this.coreRpcService.signRawTransactionWithWallet(rawtx);
            this.log.info('===========================================================================');
            this.log.info('signed: ', JSON.stringify(signed, null, 2));
            this.log.info('===========================================================================');
            if (shouldBeComplete) {
                // rawtx_complete =  buyer.combinerawtransaction(rawtx_with_buyer_sig, rawtx_with_seller_sig)
                const completeRawTx = yield this.coreRpcService.combineRawTransaction([signed.hex, rawtx]);
                this.log.info('===========================================================================');
                this.log.info('completeRawTx: ', JSON.stringify(completeRawTx, null, 2));
                this.log.info('===========================================================================');
                // const decodedTx = await this.coreRpcService.decodeRawTransaction(completeRawTx);
                // this.log.debug('createRawTx(), completeRawTx decoded:', JSON.stringify(decodedTx, null, 2));
                return completeRawTx;
            }
            else {
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
                    throw new MessageException_1.MessageException('Error signing transaction' + signed.errors ? ': ' + signed.error : '');
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
        });
    }
    /**
     *
     * @param {string} key
     * @param {module:resources.OrderItemObject[]} orderItemObjects
     * @returns {any}
     */
    getValueFromOrderItemObjects(key, orderItemObjects) {
        const value = orderItemObjects.find(kv => kv.dataId === key);
        if (value) {
            return value.dataValue[0] === '[' ? JSON.parse(value.dataValue) : value.dataValue;
        }
        else {
            this.log.error('Missing OrderItemObject value for key: ' + key);
            throw new MessageException_1.MessageException('Missing OrderItemObject value for key: ' + key);
        }
    }
    /**
     * updates rawtx
     *
     * @param {module:resources.OrderItemObject[]} orderItemObjects
     * @param {string} newRawtx
     * @returns {Promise<any>}
     */
    updateRawTxOrderItemObject(orderItemObjects, newRawtx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const rawtxObject = orderItemObjects.find(kv => kv.dataId === 'rawtx');
            if (rawtxObject) {
                const updatedOrderItemObject = yield this.orderItemObjectService.update(rawtxObject.id, {
                    dataId: BidDataValue_1.BidDataValue.RAW_TX.toString(),
                    dataValue: newRawtx
                });
                return updatedOrderItemObject.toJSON();
            }
            else {
                this.log.error('OrderItemObject for rawtx not found!');
                throw new MessageException_1.MessageException('OrderItemObject for rawtx not found!');
            }
        });
    }
    /**
     * updates orderitems status
     *
     * @param {module:resources.OrderItem} orderItem
     * @param {OrderStatus} newOrderStatus
     * @returns {Promise<module:resources.OrderItem>}
     */
    updateOrderItemStatus(orderItem, newOrderStatus) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const orderItemUpdateRequest = {
                itemHash: orderItem.itemHash,
                status: newOrderStatus
            };
            const updatedOrderItemModel = yield this.orderItemService.update(orderItem.id, orderItemUpdateRequest);
            const updatedOrderItem = updatedOrderItemModel.toJSON();
            // this.log.debug('updatedOrderItem:', JSON.stringify(updatedOrderItem, null, 2));
            return updatedOrderItem;
        });
    }
    configureEventListeners() {
        this.log.info('Configuring EventListeners ');
        this.eventEmitter.on(constants_1.Events.LockEscrowReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processLockEscrowReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.error('ERROR: EscrowLockMessage processing failed.', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING_FAILED);
            }));
        }));
        this.eventEmitter.on(constants_1.Events.ReleaseEscrowReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processReleaseEscrowReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.error('ERROR: EscrowReleaseMessage processing failed.', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING_FAILED);
            }));
        }));
        this.eventEmitter.on(constants_1.Events.RequestRefundEscrowReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processRequestRefundEscrowReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.error('ERROR: EscrowRequestRefundMessage processing failed.', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING_FAILED);
            }));
        }));
        this.eventEmitter.on(constants_1.Events.RefundEscrowReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processRefundEscrowReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.error('ERROR: EscrowRefundMessage processing failed.', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING_FAILED);
            }));
        }));
    }
};
EscrowActionService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ActionMessageService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.EscrowService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.OrderService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.OrderItemService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.OrderItemObjectService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Service.LockedOutputService)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Service.SmsgMessageService)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(10, inversify_1.named(constants_1.Targets.Factory.EscrowFactory)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(11, inversify_1.named(constants_1.Targets.Factory.OrderFactory)),
    tslib_1.__param(12, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(12, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(13, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(13, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ActionMessageService_1.ActionMessageService,
        EscrowService_1.EscrowService,
        ListingItemService_1.ListingItemService,
        SmsgService_1.SmsgService,
        OrderService_1.OrderService,
        OrderItemService_1.OrderItemService,
        OrderItemObjectService_1.OrderItemObjectService,
        CoreRpcService_1.CoreRpcService,
        LockedOutputService_1.LockedOutputService,
        SmsgMessageService_1.SmsgMessageService,
        EscrowFactory_1.EscrowFactory,
        OrderFactory_1.OrderFactory,
        events_1.EventEmitter, Object])
], EscrowActionService);
exports.EscrowActionService = EscrowActionService;
//# sourceMappingURL=EscrowActionService.js.map