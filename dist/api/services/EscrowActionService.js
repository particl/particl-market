"use strict";
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
let EscrowActionService = class EscrowActionService {
    constructor(actionMessageService, escrowService, listingItemService, smsgService, orderService, orderItemService, orderItemObjectService, coreRpcService, escrowFactory, orderFactory, eventEmitter, Logger) {
        this.actionMessageService = actionMessageService;
        this.escrowService = escrowService;
        this.listingItemService = listingItemService;
        this.smsgService = smsgService;
        this.orderService = orderService;
        this.orderItemService = orderItemService;
        this.orderItemObjectService = orderItemObjectService;
        this.coreRpcService = coreRpcService;
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
     * @param {"resources".OrderItem} orderItem
     * @returns {Promise<SmsgSendResponse>}
     */
    lock(escrowRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo: add @validate to EscrowLockRequest
            const orderItem = escrowRequest.orderItem;
            const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;
            if (_.isEmpty(orderItem)) {
                throw new MessageException_1.MessageException('OrderItem not found!');
            }
            if (_.isEmpty(escrow)) {
                throw new MessageException_1.MessageException('Escrow not found!');
            }
            // generate rawtx
            const rawtx = yield this.createRawTx(escrowRequest);
            const updatedRawTx = yield this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);
            // update OrderItemStatus
            const newOrderStatus = OrderStatus_1.OrderStatus.ESCROW_LOCKED;
            const updatedOrderItem = yield this.updateOrderItemStatus(orderItem, newOrderStatus);
            // use escrowfactory to generate the lock message
            const escrowActionMessage = yield this.escrowFactory.getMessage(escrowRequest, rawtx);
            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: escrowActionMessage
            };
            return yield this.smsgService.smsgSend(orderItem.Order.buyer, orderItem.Order.seller, marketPlaceMessage, false);
        });
    }
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
    release(escrowRequest) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo: refactor lock/refund/release since they're pretty much the same
            // todo: add @validate to EscrowLockRequest
            const orderItem = escrowRequest.orderItem;
            const escrow = orderItem.Bid.ListingItem.PaymentInformation.Escrow;
            if (_.isEmpty(orderItem)) {
                throw new MessageException_1.MessageException('OrderItem not found!');
            }
            if (_.isEmpty(escrow)) {
                throw new MessageException_1.MessageException('Escrow not found!');
            }
            // generate rawtx
            const rawtx = yield this.createRawTx(escrowRequest);
            const updatedRawTx = yield this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);
            // update OrderStatus
            const isMyListingItem = !_.isEmpty(orderItem.Bid.ListingItem.ListingItemTemplate);
            const newOrderStatus = isMyListingItem ? OrderStatus_1.OrderStatus.SHIPPING : OrderStatus_1.OrderStatus.COMPLETE;
            const updatedOrderItem = yield this.updateOrderItemStatus(orderItem, newOrderStatus);
            // use escrowfactory to generate the release message
            const escrowActionMessage = yield this.escrowFactory.getMessage(escrowRequest, rawtx);
            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: escrowActionMessage
            };
            this.log.debug('orderItem: ', JSON.stringify(orderItem, null, 2));
            this.log.debug('isMyListingItem: ', isMyListingItem);
            const sendFromAddress = isMyListingItem ? orderItem.Order.seller : orderItem.Order.buyer;
            const sendToAddress = isMyListingItem ? orderItem.Order.buyer : orderItem.Order.seller;
            return yield this.smsgService.smsgSend(sendFromAddress, sendToAddress, marketPlaceMessage, false);
        });
    }
    /**
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<"resources".ActionMessage>}
     */
    processLockEscrowReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: EscrowMessage should contain Order.hash to identify the item in case there are two different Orders
            // with the same item for same buyer. Currently, buyer can only bid once for an item, but this might not be the case always.
            this.log.info('Received event:', event);
            const message = event.marketplaceMessage;
            if (!message.mpaction) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            const escrowMessage = message.mpaction;
            const listingItemHash = escrowMessage.item;
            // find the ListingItem
            const listingItemModel = yield this.listingItemService.findOneByHash(listingItemHash);
            const listingItem = listingItemModel.toJSON();
            const seller = listingItem.seller;
            const buyer = listingItem.seller === event.smsgMessage.from ? event.smsgMessage.to : event.smsgMessage.from;
            // save ActionMessage
            const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
            const actionMessage = actionMessageModel.toJSON();
            // find Order, using buyer, seller and Order.OrderItem.itemHash
            const ordersModel = yield this.orderService.search({
                listingItemHash,
                buyerAddress: buyer,
                sellerAddress: seller
            });
            const orders = ordersModel.toJSON();
            if (orders.length === 0) {
                this.log.error('Order not found for EscrowMessage.');
                throw new MessageException_1.MessageException('Order not found for EscrowMessage.');
            }
            if (orders.length > 1) {
                this.log.error('Multiple Orders found for EscrowMessage, this should not happen.');
                throw new MessageException_1.MessageException('Multiple Orders found for EscrowMessage.');
            }
            // update OrderItemStatus
            const order = orders[0];
            const orderItem = _.find(order.OrderItems, (o) => {
                return o.itemHash === listingItemHash;
            });
            if (orderItem) {
                // update rawtx
                const rawtx = escrowMessage.escrow.rawtx;
                const updatedRawTx = yield this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);
                const newOrderStatus = OrderStatus_1.OrderStatus.ESCROW_LOCKED;
                const updatedOrderItem = yield this.updateOrderItemStatus(orderItem, newOrderStatus);
                // TODO: do whatever else needs to be done
            }
            else {
                this.log.error('OrderItem not found for EscrowMessage.');
                throw new MessageException_1.MessageException('OrderItem not found for EscrowMessage.');
            }
            return order;
        });
    }
    processReleaseEscrowReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.info('Received event:', event);
            const message = event.marketplaceMessage;
            if (!message.mpaction) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            const escrowMessage = message.mpaction;
            const listingItemHash = escrowMessage.item;
            // find the ListingItem
            const listingItemModel = yield this.listingItemService.findOneByHash(listingItemHash);
            const listingItem = listingItemModel.toJSON();
            const seller = listingItem.seller;
            const buyer = listingItem.seller === event.smsgMessage.from ? event.smsgMessage.to : event.smsgMessage.from;
            const isMyListingItem = !!listingItem.ListingItemTemplate;
            // save ActionMessage
            const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
            const actionMessage = actionMessageModel.toJSON();
            // find Order, using buyer, seller and Order.OrderItem.itemHash
            const ordersModel = yield this.orderService.search({
                listingItemHash,
                buyerAddress: buyer,
                sellerAddress: seller
            });
            const orders = ordersModel.toJSON();
            if (orders.length === 0) {
                this.log.error('Order not found for EscrowMessage.');
                throw new MessageException_1.MessageException('Order not found for EscrowMessage.');
            }
            if (orders.length > 1) {
                this.log.error('Multiple Orders found for EscrowMessage, this should not happen.');
                throw new MessageException_1.MessageException('Multiple Orders found for EscrowMessage.');
            }
            // update OrderItemStatus
            const order = orders[0];
            const orderItem = _.find(order.OrderItems, (o) => {
                return o.itemHash === listingItemHash;
            });
            if (orderItem) {
                // update rawtx
                const rawtx = escrowMessage.escrow.rawtx;
                const updatedRawTx = yield this.updateRawTxOrderItemObject(orderItem.OrderItemObjects, rawtx);
                const newOrderStatus = isMyListingItem ? OrderStatus_1.OrderStatus.COMPLETE : OrderStatus_1.OrderStatus.SHIPPING;
                const updatedOrderItem = yield this.updateOrderItemStatus(orderItem, newOrderStatus);
                // TODO: do whatever else needs to be done
            }
            else {
                this.log.error('OrderItem not found for EscrowMessage.');
                throw new MessageException_1.MessageException('OrderItem not found for EscrowMessage.');
            }
            return order;
        });
    }
    processRequestRefundEscrowReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.info('Received event:', event);
            // find the ListingItem
            const message = event.marketplaceMessage;
            if (!message.mpaction) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            const listingItemModel = yield this.listingItemService.findOneByHash(message.mpaction.item);
            const listingItem = listingItemModel.toJSON();
            // first save it
            const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
            const actionMessage = actionMessageModel.toJSON();
            // TODO: do whatever else needs to be done
            return actionMessage;
        });
    }
    processRefundEscrowReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.info('Received event:', event);
            // find the ListingItem
            const message = event.marketplaceMessage;
            if (!message.mpaction) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            const listingItemModel = yield this.listingItemService.findOneByHash(message.mpaction.item);
            const listingItem = listingItemModel.toJSON();
            // first save it
            const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
            const actionMessage = actionMessageModel.toJSON();
            // TODO: do whatever else needs to be done
            return actionMessage;
        });
    }
    /**
     * Creates rawtx based on params
     *
     * @param request
     * @param escrow
     * @returns {string}
     */
    createRawTx(request, testRun = false) {
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
            const isMyListingItem = !_.isEmpty(orderItem.Bid.ListingItem.ListingItemTemplate);
            // rawtx is potentially the txid in case of ESCROW_LOCKED.
            let rawtx = this.getValueFromOrderItemObjects('rawtx', orderItem.OrderItemObjects);
            let pubkeys = this.getValueFromOrderItemObjects('pubkeys', orderItem.OrderItemObjects);
            pubkeys = JSON.parse(pubkeys);
            if (!bid || bid.action !== BidMessageType_1.BidMessageType.MPA_ACCEPT
                || !orderItem || !orderItem.OrderItemObjects || orderItem.OrderItemObjects.length === 0
                || !rawtx || !pubkeys) {
                this.log.error('Not enough valid information to finalize escrow');
                throw new MessageException_1.MessageException('Not enough valid information to finalize escrow');
            }
            switch (request.action) {
                case EscrowMessageType_1.EscrowMessageType.MPA_LOCK:
                    // to lock:
                    // - you need to be the bidder/buyer,
                    // - the Bid needs to be in MPA_ACCEPT state,
                    // - bidDatas, rawtx and pubkeys need to have been collected
                    if (isMyListingItem) {
                        throw new MessageException_1.MessageException('Seller can\'t lock an Escrow.');
                    }
                    // rawtx = rawtx ? rawtx.dataValue as string : '';
                    // pubkeys = pubkeys ? pubkeys.dataValue[0] === '[' ? JSON.parse(pubkeys.dataValue).sort() : pubkeys.dataValue : [];
                    // Add Escrow address
                    // TODO: Way to recover escrow address should we lose it
                    // TODO: add this to OrderItemObjects?
                    const escrowAddr = yield this.coreRpcService.addMultiSigAddress(2, pubkeys.sort(), '_escrow_' + orderItem.itemHash);
                    // const escrowAddr = (await this.coreRpcService.call('addmultisigaddress', [2, pubkeys, '_escrow_' + request.item]));
                    const signedForLock = yield this.signRawTx(rawtx, true);
                    // TODO: This requires user interaction, so should be elsewhere possibly?
                    // TODO: Save TXID somewhere maybe??!
                    const response = yield this.coreRpcService.sendRawTransaction(signedForLock.hex);
                    // return await this.coreRpcService.call('sendrawtransaction', [signed.hex]);
                    this.log.debug('response:', JSON.stringify(response, null, 2));
                    return response;
                case EscrowMessageType_1.EscrowMessageType.MPA_RELEASE:
                    // to seller to release:
                    // - you need to be the seller,
                    // - orderItem.status must be ESCROW_LOCKED,
                    // - bidDatas/orderItemObjects, rawtx and pubkeys need to have been collected
                    // we cant fetch the messageobjects like this, seller ListingItem can have ActionMessages coming from multiple bidders/buyers
                    // const release = listing.ActionMessages.find(actionMessage => actionMessage.action === EscrowMessageType.MPA_RELEASE);
                    if (OrderStatus_1.OrderStatus.ESCROW_LOCKED === orderItem.status && isMyListingItem) {
                        // seller sends the first MPA_RELEASE, OrderStatus.ESCROW_LOCKED
                        // TODO: all keys should be enums
                        // TODO: naming something 'address' could mean any address and 'sellerAddress' means Profile.address of the seller
                        // TODO: earlier I think it was assumed that buyer releases the Escrow first,
                        // TODO: so should we actually have buyerReleaseAddress here?
                        const releaseAddress = this.getValueFromOrderItemObjects('address', orderItem.OrderItemObjects);
                        // let sellerAddress: string | resources.BidData | undefined = bidData.find(entry => entry.dataId === 'address');
                        if (!releaseAddress) {
                            this.log.error('Not enough valid information to finalize escrow');
                            throw new MessageException_1.MessageException('Not enough valid information to finalize escrow');
                        }
                        const myAddress = yield this.coreRpcService.getNewAddress(['_escrow_release'], false);
                        // const myAddress = await this.coreRpcService.call('getnewaddress', ['_escrow_release']);
                        // rawtx is the transaction id!
                        const realrawtx = yield this.coreRpcService.getRawTransaction(rawtx);
                        const decoded = yield this.coreRpcService.decodeRawTransaction(realrawtx);
                        // const decoded = await this.coreRpcService.call('decoderawtransaction', [rawtx]);
                        const txid = decoded.txid;
                        const value = decoded.vout[0].value - 0.0001; // TODO: Proper TX Fee
                        if (!txid) {
                            this.log.error(`Transaction with not found with txid: ${txid}.`);
                            throw new MessageException_1.MessageException(`Transaction with not found with txid: ${txid}.`);
                        }
                        const txout = {};
                        // CRITICAL TODO: Use the right ratio's...
                        txout[myAddress] = value / 3;
                        txout[releaseAddress] = (value / 3) * 2;
                        this.log.debug('txout untruncated: ', txout);
                        // Kewde: simple truncation to 8
                        const truncateToDecimals = (int) => {
                            const calcDec = Math.pow(10, 8);
                            return Math.trunc(int * calcDec) / calcDec;
                        };
                        txout[myAddress] = truncateToDecimals(txout[myAddress]);
                        txout[releaseAddress] = truncateToDecimals(txout[releaseAddress]);
                        this.log.debug('final txout: ', txout);
                        const outputs = [{ txid, vout: 0 }]; // TODO: Make sure this is the correct vout
                        this.log.debug('inputs: ', outputs);
                        rawtx = yield this.coreRpcService.createRawTransaction(outputs, txout);
                        // rawtx = await this.coreRpcService.call('createrawtransaction', [
                        //    [{txid, vout: 0}], // TODO: Make sure this is the correct vout
                        //    txout
                        // ]);
                        // TODO: This requires user interaction, so should be elsewhere possibly?
                        const signedForReleaseBySeller = yield this.signRawTx(rawtx, false);
                        return signedForReleaseBySeller.hex;
                    }
                    else if (OrderStatus_1.OrderStatus.SHIPPING === orderItem.status && !isMyListingItem) {
                        // buyer sends the MPA_RELEASE, OrderStatus.SHIPPING
                        const signedForReleaseByBuyer = yield this.signRawTx(rawtx, true);
                        return yield this.coreRpcService.sendRawTransaction(signedForReleaseByBuyer.hex);
                        // return await this.coreRpcService.call('sendrawtransaction', [
                        //    (await signTx(release.MessageObjects.find(object => object.dataId === 'rawtx'), true)).hex
                        // ]);
                    }
                    else {
                        throw new MessageException_1.MessageException('Something went wrong, MPA_RELEASE should not be sent at this point.');
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
                    throw new NotImplementedException_1.NotImplementedException();
            }
        });
    }
    configureEventListeners() {
        this.eventEmitter.on(constants_1.Events.LockEscrowReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.processLockEscrowReceivedEvent(event);
        }));
        this.eventEmitter.on(constants_1.Events.ReleaseEscrowReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.processReleaseEscrowReceivedEvent(event);
        }));
        this.eventEmitter.on(constants_1.Events.RequestRefundEscrowReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.processRequestRefundEscrowReceivedEvent(event);
        }));
        this.eventEmitter.on(constants_1.Events.RefundEscrowReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.processRefundEscrowReceivedEvent(event);
        }));
    }
    signRawTx(rawtx, shouldBeComplete) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('signRawTx: signing rawtx and expecting it to be complete:', shouldBeComplete);
            // This requires user interaction, so should be elsewhere possibly?
            // TODO: Verify that the transaction has the correct values! Very important!!! TODO TODO TODO
            const signed = yield this.coreRpcService.signRawTransaction(rawtx);
            const ignoreErrors = [
                'Unable to sign input, invalid stack size (possibly missing key)',
                'Operation not valid with the current stack size'
            ];
            if (!signed
                || signed.errors
                    && (!shouldBeComplete && ignoreErrors.indexOf(signed.errors[0].error) === -1 || shouldBeComplete)) {
                // TODO: ^^ is this correct?!
                this.log.error('Error signing transaction' + signed ? ': ' + signed.errors[0].error : '');
                throw new MessageException_1.MessageException('Error signing transaction' + signed ? ': ' + signed.error : '');
            }
            if (shouldBeComplete) {
                if (!signed.complete) {
                    this.log.error('Transaction should be complete at this stage.', signed);
                    throw new MessageException_1.MessageException('Transaction should be complete at this stage');
                }
            }
            else if (signed.complete) {
                this.log.error('Transaction should not be complete at this stage, will not send insecure message');
                throw new MessageException_1.MessageException('Transaction should not be complete at this stage, will not send insecure message');
            }
            return signed;
        });
    }
    /**
     *
     * @param {string} key
     * @param {"resources".OrderItemObject[]} orderItemObjects
     * @returns {any}
     */
    getValueFromOrderItemObjects(key, orderItemObjects) {
        const value = orderItemObjects.find(kv => kv.dataId === key);
        if (value) {
            return value.dataValue;
        }
        else {
            this.log.error('Missing OrderItemObject value for key: ' + key);
            throw new MessageException_1.MessageException('Missing OrderItemObject value for key: ' + key);
        }
    }
    updateRawTxOrderItemObject(orderItemObjects, newRawtx) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const rawtxObject = orderItemObjects.find(kv => kv.dataId === 'rawtx');
            if (rawtxObject) {
                const updatedOrderItemObject = yield this.orderItemObjectService.update(rawtxObject.id, {
                    dataId: 'rawtx',
                    dataValue: newRawtx
                });
                return updatedOrderItemObject.toJSON();
            }
            else {
                throw new MessageException_1.MessageException('OrderItemObject for rawtx not found!');
            }
        });
    }
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
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Factory.EscrowFactory)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Factory.OrderFactory)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(10, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(11, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ActionMessageService_1.ActionMessageService,
        EscrowService_1.EscrowService,
        ListingItemService_1.ListingItemService,
        SmsgService_1.SmsgService,
        OrderService_1.OrderService,
        OrderItemService_1.OrderItemService,
        OrderItemObjectService_1.OrderItemObjectService,
        CoreRpcService_1.CoreRpcService,
        EscrowFactory_1.EscrowFactory,
        OrderFactory_1.OrderFactory,
        events_1.EventEmitter, Object])
], EscrowActionService);
exports.EscrowActionService = EscrowActionService;
//# sourceMappingURL=EscrowActionService.js.map