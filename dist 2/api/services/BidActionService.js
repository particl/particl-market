"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const MessageException_1 = require("../exceptions/MessageException");
const events_1 = require("events");
const ActionMessageService_1 = require("./ActionMessageService");
const BidService_1 = require("./BidService");
const ProfileService_1 = require("./ProfileService");
const MarketService_1 = require("./MarketService");
const BidFactory_1 = require("../factories/BidFactory");
const SmsgService_1 = require("./SmsgService");
const CoreRpcService_1 = require("./CoreRpcService");
const ListingItemService_1 = require("./ListingItemService");
const BidMessageType_1 = require("../enums/BidMessageType");
const BidSearchParams_1 = require("../requests/BidSearchParams");
const AddressType_1 = require("../enums/AddressType");
const SearchOrder_1 = require("../enums/SearchOrder");
const OrderFactory_1 = require("../factories/OrderFactory");
const OrderService_1 = require("./OrderService");
const BidDataService_1 = require("./BidDataService");
const LockedOutputService_1 = require("./LockedOutputService");
const BidDataValue_1 = require("../enums/BidDataValue");
const SmsgMessageStatus_1 = require("../enums/SmsgMessageStatus");
const SmsgMessageService_1 = require("./SmsgMessageService");
let BidActionService = class BidActionService {
    constructor(listingItemService, marketService, actionMessageService, profileService, smsgService, bidService, bidDataService, orderService, coreRpcService, lockedOutputService, smsgMessageService, bidFactory, orderFactory, eventEmitter, Logger) {
        this.listingItemService = listingItemService;
        this.marketService = marketService;
        this.actionMessageService = actionMessageService;
        this.profileService = profileService;
        this.smsgService = smsgService;
        this.bidService = bidService;
        this.bidDataService = bidDataService;
        this.orderService = orderService;
        this.coreRpcService = coreRpcService;
        this.lockedOutputService = lockedOutputService;
        this.smsgMessageService = smsgMessageService;
        this.bidFactory = bidFactory;
        this.orderFactory = orderFactory;
        this.eventEmitter = eventEmitter;
        this.Logger = Logger;
        this.log = new Logger(__filename);
        this.configureEventListeners();
    }
    /**
     * Send a Bid
     *
     * @param {module:resources.ListingItem} listingItem
     * @param {module:resources.Profile} bidderProfile
     * @param {any[]} additionalParams
     * @returns {Promise<SmsgSendResponse>}
     */
    send(listingItem, bidderProfile, additionalParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // TODO: change send params to BidSendRequest and @validate them
            // TODO: some of this stuff could propably be moved to the factory
            // TODO: Create new unspent RPC call for unspent outputs that came out of a RingCT transaction
            // generate bidDatas for the message
            const bidDatas = yield this.generateBidDatasForMPA_BID(listingItem, additionalParams);
            // this.log.debug('bidder profile: ', JSON.stringify(bidderProfile, null, 2));
            // create MPA_BID message
            const bidMessage = yield this.bidFactory.getMessage(BidMessageType_1.BidMessageType.MPA_BID, listingItem.hash, bidDatas);
            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            };
            this.log.debug('send(), marketPlaceMessage: ', JSON.stringify(marketPlaceMessage, null, 2));
            // save bid locally before broadcasting
            const createdBid = yield this.createBid(bidMessage, listingItem, bidderProfile.address);
            // this.log.debug('createdBid:', JSON.stringify(createdBid, null, 2));
            // store the selected outputs, so we can load and lock them again on mp restart
            let selectedOutputs = this.getValueFromBidDatas(BidDataValue_1.BidDataValue.BUYER_OUTPUTS, createdBid.BidDatas);
            selectedOutputs = selectedOutputs[0] === '[' ? JSON.parse(selectedOutputs) : selectedOutputs;
            const createdLockedOutputs = yield this.lockedOutputService.createLockedOutputs(selectedOutputs, createdBid.id);
            const success = yield this.lockedOutputService.lockOutputs(createdLockedOutputs);
            if (success) {
                // broadcast the message to the network
                return yield this.smsgService.smsgSend(bidderProfile.address, listingItem.seller, marketPlaceMessage, false);
            }
            else {
                throw new MessageException_1.MessageException('Failed to lock the selected outputs.');
            }
        });
    }
    /**
     * generate the required biddatas for MPA_BID message
     *
     * @param {module:resources.ListingItem} listingItem
     * @param {any[]} additionalParams
     * @returns {Promise<IdValuePair[]>}
     */
    generateBidDatasForMPA_BID(listingItem, additionalParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // todo: propably something that we should check earlier
            // todo: and we shouldnt even be having items without a price at the moment, validation before posting should take care of that
            // todo: this could also be caused by of some other error, while saving the item
            if (!listingItem.PaymentInformation.ItemPrice || !listingItem.PaymentInformation.ItemPrice.basePrice) {
                this.log.warn(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
                throw new MessageException_1.MessageException(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
            }
            // this.log.debug('listingItem.PaymentInformation: ', JSON.stringify(listingItem.PaymentInformation, null, 2));
            // todo: calculate correct shippingPrice
            const shippingPrice = listingItem.PaymentInformation.ItemPrice.ShippingPrice;
            const basePrice = listingItem.PaymentInformation.ItemPrice.basePrice;
            const shippingPriceMax = Math.max(shippingPrice.international, shippingPrice.domestic);
            const totalPrice = basePrice + shippingPriceMax; // TODO: Determine if local or international...
            const requiredAmount = totalPrice * 2; // todo: bidders required amount
            // todo: calculate totalprice using the items escrowratio
            this.log.debug('totalPrice: ', totalPrice);
            // returns: {
            //    outputs
            //    outputsSum
            //    outputsChangeAmount
            // }
            const buyerSelectedOutputData = yield this.findUnspentOutputs(requiredAmount);
            // changed to getNewAddress, since getaccountaddress doesn't return address which we can get the pubkey from
            const buyerEscrowPubAddress = yield this.coreRpcService.getNewAddress(['_escrow_pub_' + listingItem.hash], false);
            const buyerEscrowChangeAddress = yield this.coreRpcService.getNewAddress(['_escrow_change'], false);
            this.log.debug('buyerEscrowPubAddress: ', buyerEscrowPubAddress);
            this.log.debug('buyerEscrowChangeAddress: ', buyerEscrowChangeAddress);
            // 0.16.0.3
            // const buyerEscrowPubAddressInformation = await this.coreRpcService.validateAddress(buyerEscrowPubAddress);
            // const buyerEcrowPubAddressPublicKey = buyerEscrowPubAddressInformation.pubkey;
            // 0.17++ ...
            const buyerEscrowPubAddressInformation = yield this.coreRpcService.getAddressInfo(buyerEscrowPubAddress);
            const buyerEcrowPubAddressPublicKey = buyerEscrowPubAddressInformation.pubkey || buyerEscrowPubAddressInformation.scriptPubKey;
            this.log.debug('buyerEscrowPubAddressInformation: ', JSON.stringify(buyerEscrowPubAddressInformation, null, 2));
            if (!buyerEcrowPubAddressPublicKey) {
                throw new MessageException_1.MessageException('Could not get public key for buyerEscrowPubAddress!');
            }
            // TODO: We need to send a refund / release address
            // TODO: address should be named releaseAddress or sellerReleaseAddress and all keys should be enums,
            // it's confusing when on escrowactionservice this 'address' is referred to as sellers address which it is not
            const buyerEscrowReleaseAddress = yield this.coreRpcService.getNewAddress(['_escrow_release'], false);
            // convert the bid data params as bid data key value pair
            // todo: refactor to use resources.BidData instead of this IdValuePair
            const bidDatas = this.getIdValuePairsFromArray([
                BidDataValue_1.BidDataValue.BUYER_OUTPUTS, buyerSelectedOutputData.outputs,
                BidDataValue_1.BidDataValue.BUYER_PUBKEY, buyerEcrowPubAddressPublicKey,
                BidDataValue_1.BidDataValue.BUYER_CHANGE_ADDRESS, buyerEscrowChangeAddress,
                BidDataValue_1.BidDataValue.BUYER_CHANGE_AMOUNT, buyerSelectedOutputData.outputsChangeAmount,
                BidDataValue_1.BidDataValue.BUYER_RELEASE_ADDRESS, buyerEscrowReleaseAddress
            ]).concat(additionalParams);
            // this.log.debug('bidDatas: ', JSON.stringify(bidDatas, null, 2));
            return bidDatas;
        });
    }
    /**
     * find unspent outputs for the required amount
     *
     * @param {number} requiredAmount
     * @returns {Promise<any>}
     */
    findUnspentOutputs(requiredAmount) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // requiredAmount, for MPA_BID: (totalPrice * 2)
            // requiredAmount, for MPA_ACCEPT: totalPrice
            // todo: get the actual fee
            const TRANSACTION_FEE = 0.0002;
            const adjustedRequiredAmount = this.correctNumberDecimals(requiredAmount + TRANSACTION_FEE);
            const selectedOutputs = [];
            let selectedOutputsSum = 0;
            let selectedOutputsChangeAmount = 0;
            const utxoLessThanReqestedAmount = [];
            let utxoIdxs = [];
            let exactMatchIdx = -1;
            let maxOutputIdx = -1;
            const defaultselectedOutputsIdxs = [];
            // get all unspent transaction outputs
            const unspentOutputs = yield this.coreRpcService.listUnspent(1, 99999999, [], false);
            // Loop over all outputs once to obtain various fitlering information
            unspentOutputs.filter((output, outIdx) => {
                if (output.spendable && output.solvable && output.safe) {
                    if ((exactMatchIdx === -1) && (this.correctNumberDecimals(output.amount - adjustedRequiredAmount) === 0)) {
                        // Found a utxo with amount that is an exact match for the requested amount.
                        exactMatchIdx = outIdx;
                    }
                    else if (output.amount < adjustedRequiredAmount) {
                        // utxo is less than the amount requested, so may be summable with others to get to the exact value (or within a close threshold).
                        utxoLessThanReqestedAmount.push(outIdx);
                    }
                    // Get the max utxo amount in case an output needs to be split
                    if (maxOutputIdx === -1) {
                        maxOutputIdx = outIdx;
                    }
                    else if (unspentOutputs[maxOutputIdx].amount < output.amount) {
                        maxOutputIdx = outIdx;
                    }
                    // Sum up output amounts for the default case
                    if (selectedOutputsSum < adjustedRequiredAmount) {
                        selectedOutputsSum += output.amount;
                        defaultselectedOutputsIdxs.push(outIdx);
                    }
                    return true;
                }
                return false;
            });
            // Step 1: Check whether an exact match was found.
            if (exactMatchIdx === -1) {
                // No exact match found, so...
                //  ... Step 2: Sum utxos to find a summed group that matches exactly or is greater than the requried amount by no more than 1%.
                for (let ii = 0; ii < Math.pow(2, utxoLessThanReqestedAmount.length); ii++) {
                    const potentialIdxs = utxoLessThanReqestedAmount.filter((num, index) => ii & (1 << index));
                    const summed = this.correctNumberDecimals(potentialIdxs.reduce((acc, idx) => acc + unspentOutputs[idx].amount, 0));
                    if ((summed >= adjustedRequiredAmount) && ((summed - adjustedRequiredAmount) < (adjustedRequiredAmount / 100))) {
                        // Sum of utxos is within a 1 percent upper margin of the requested amount.
                        if (summed === adjustedRequiredAmount) {
                            // Found the exact required amount.
                            utxoIdxs = potentialIdxs;
                            break;
                        }
                        else if (!utxoIdxs.length) {
                            utxoIdxs.length = 0;
                            utxoIdxs = potentialIdxs;
                        }
                    }
                }
                // ... Step 3: If no summed values found, attempt to split a large enough output.
                if (utxoIdxs.length === 0 && maxOutputIdx !== -1 && unspentOutputs[maxOutputIdx].amount > adjustedRequiredAmount) {
                    const newAddress = yield this.coreRpcService.getNewAddress([], false);
                    // sendtoaddress will create a new transaction with its own selection of utxos to use, ie: the output with the max amount is not necessary used
                    const txid = yield this.coreRpcService.call('sendtoaddress', [newAddress, adjustedRequiredAmount.toFixed(8), 'Split output']);
                    const txData = yield this.coreRpcService.call('getrawtransaction', [txid, true]);
                    const outputData = txData.vout.find(outputObject => outputObject.value.toFixed(8) === adjustedRequiredAmount.toFixed(8));
                    if (outputData) {
                        selectedOutputs.push({
                            txid: txData.txid,
                            vout: outputData.n,
                            amount: outputData.value
                        });
                        selectedOutputsSum = outputData.value;
                    }
                }
            }
            else {
                // Push the exact match.
                utxoIdxs.push(exactMatchIdx);
            }
            // Step 4: Default to the summed utxos if no other method was successful
            if (!selectedOutputs.length && !utxoIdxs.length) {
                if (selectedOutputsSum >= adjustedRequiredAmount) {
                    utxoIdxs = defaultselectedOutputsIdxs;
                }
                else {
                    this.log.warn('Not enough funds');
                    throw new MessageException_1.MessageException('Not enough funds');
                }
            }
            if (utxoIdxs.length) {
                selectedOutputsSum = 0;
                for (const utxoIdx of utxoIdxs) {
                    const utxo = unspentOutputs[utxoIdx];
                    selectedOutputs.push({
                        txid: utxo.txid,
                        vout: utxo.vout,
                        amount: utxo.amount
                    });
                    selectedOutputsSum += utxo.amount;
                }
            }
            selectedOutputsChangeAmount = +(selectedOutputsSum - adjustedRequiredAmount).toFixed(8);
            // todo: type
            const response = {
                outputs: selectedOutputs,
                outputsSum: selectedOutputsSum,
                outputsChangeAmount: selectedOutputsChangeAmount
            };
            this.log.debug('selected outputs:', JSON.stringify(response, null, 2));
            return response;
        });
    }
    /**
     * Accept a Bid
     *
     * @param {module:resources.Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    accept(bid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // previous bids action needs to be MPA_BID
            if (bid.action === BidMessageType_1.BidMessageType.MPA_BID) {
                const listingItem = yield this.listingItemService.findOne(bid.ListingItem.id, true)
                    .then(value => {
                    return value.toJSON();
                });
                // todo: create order before biddatas so order hash can be added to biddata in generateBidDatasForMPA_ACCEPT
                // generate bidDatas for MPA_ACCEPT
                const bidDatas = yield this.generateBidDatasForMPA_ACCEPT(listingItem, bid);
                // create the bid accept message using the generated bidDatas
                const bidMessage = yield this.bidFactory.getMessage(BidMessageType_1.BidMessageType.MPA_ACCEPT, listingItem.hash, bidDatas);
                // this.log.debug('accept(), created bidMessage (MPA_ACCEPT):', JSON.stringify(bidMessage, null, 2));
                // update the bid locally
                const bidUpdateRequest = yield this.bidFactory.getModel(bidMessage, listingItem.id, bid.bidder, bid);
                const updatedBidModel = yield this.bidService.update(bid.id, bidUpdateRequest);
                const updatedBid = updatedBidModel.toJSON();
                // this.log.debug('accept(), updatedBid:', JSON.stringify(updatedBid, null, 2));
                // create the order
                const orderCreateRequest = yield this.orderFactory.getModelFromBid(updatedBid);
                const orderModel = yield this.orderService.create(orderCreateRequest);
                const order = orderModel.toJSON();
                this.log.debug('accept(), created Order: ', JSON.stringify(order, null, 2));
                // this.log.debug('accept(), created bidMessage.objects: ', bidMessage.objects);
                // put the order.hash in BidMessage and also save it
                // todo: this is here because bidMessage.objects 'possibly undefined', which it never really should be
                if (!bidMessage.objects) {
                    bidMessage.objects = [];
                }
                bidMessage.objects.push({ id: BidDataValue_1.BidDataValue.ORDER_HASH, value: order.hash });
                // TODO: clean this up, so that we can add this with bidService.update
                const orderHashBidData = yield this.bidDataService.create({
                    bid_id: updatedBid.id,
                    dataId: BidDataValue_1.BidDataValue.ORDER_HASH.toString(),
                    dataValue: order.hash
                });
                // this.log.debug('accept(), updatedBid.id: ', updatedBid.id);
                // this.log.debug('accept(), order.hash: ', order.hash);
                // this.log.debug('accept(), added orderHash to bidData: ', orderHashBidData.toJSON());
                // store the sellers selected outputs in db, so we can load and lock them again on mp restart
                let selectedOutputs = this.getValueFromBidDatas(BidDataValue_1.BidDataValue.SELLER_OUTPUTS, updatedBid.BidDatas);
                selectedOutputs = selectedOutputs[0] === '[' ? JSON.parse(selectedOutputs) : selectedOutputs;
                const createdLockedOutputs = yield this.lockedOutputService.createLockedOutputs(selectedOutputs, bid.id);
                const success = yield this.lockedOutputService.lockOutputs(createdLockedOutputs);
                const marketPlaceMessage = {
                    version: process.env.MARKETPLACE_VERSION,
                    mpaction: bidMessage
                };
                if (success) {
                    // broadcast the MPA_ACCEPT message
                    this.log.debug('send(), marketPlaceMessage: ', JSON.stringify(marketPlaceMessage, null, 2));
                    return yield this.smsgService.smsgSend(listingItem.seller, updatedBid.bidder, marketPlaceMessage, false);
                }
                else {
                    throw new MessageException_1.MessageException('Failed to lock the selected outputs.');
                }
            }
            else {
                this.log.error(`Bid can not be accepted because its state allready is ${bid.action}`);
                throw new MessageException_1.MessageException(`Bid can not be accepted because its state already is ${bid.action}`);
            }
        });
    }
    /**
     * generate the required biddatas for MPA_ACCEPT message
     *
     * @param {module:resources.ListingItem} listingItem
     * @param {module:resources.Bid} bid
     * @returns {Promise<any[]>}
     */
    generateBidDatasForMPA_ACCEPT(listingItem, bid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (_.isEmpty(listingItem.PaymentInformation.ItemPrice)) {
                this.log.warn(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
                throw new MessageException_1.MessageException(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
            }
            // todo: price type...
            const shippingPrice = listingItem.PaymentInformation.ItemPrice.ShippingPrice;
            const basePrice = listingItem.PaymentInformation.ItemPrice.basePrice;
            const shippingPriceMax = Math.max(shippingPrice.international, shippingPrice.domestic);
            const totalPrice = basePrice + shippingPriceMax; // TODO: Determine if local or international...
            const requiredAmount = totalPrice; // todo: sellers required amount
            // todo: calculate totalprice using the items escrowratio
            this.log.debug('totalPrice: ', totalPrice);
            // returns: {
            //    outputs: Output[]
            //    outputsSum
            //    outputsChangeAmount
            // }
            const sellerSelectedOutputData = yield this.findUnspentOutputs(requiredAmount);
            // create OutputData for buyer
            const buyerSelectedOutputs = JSON.parse(this.getValueFromBidDatas(BidDataValue_1.BidDataValue.BUYER_OUTPUTS, bid.BidDatas));
            const buyerOutputsSum = buyerSelectedOutputs.reduce((acc, obj) => {
                const amount = obj.amount || 0;
                return acc + amount;
            }, 0);
            const buyerRequiredAmount = totalPrice * 2;
            const buyerSelectedOutputsChangeAmount = +(buyerOutputsSum - buyerRequiredAmount - 0.0002).toFixed(8);
            // TODO: validate that the outputs are not spent
            if (buyerOutputsSum < buyerRequiredAmount) {
                this.log.warn('Not enough funds');
                throw new MessageException_1.MessageException('Not enough funds');
            }
            const buyerSelectedOutputData = {
                outputs: buyerSelectedOutputs,
                outputsSum: buyerOutputsSum,
                outputsChangeAmount: buyerSelectedOutputsChangeAmount
            };
            this.log.debug('sellerSelectedOutputData: ', JSON.stringify(sellerSelectedOutputData, null, 2));
            this.log.debug('buyerSelectedOutputData: ', JSON.stringify(buyerSelectedOutputData, null, 2));
            // create seller escrow addresses
            // changed to getNewAddress, since getaccountaddress doesn't return address which we can get the pubkey from
            const sellerEscrowPubAddress = yield this.coreRpcService.getNewAddress(['_escrow_pub_' + listingItem.hash], false);
            const sellerEscrowChangeAddress = yield this.coreRpcService.getNewAddress(['_escrow_change'], false);
            const buyerEscrowChangeAddress = this.getValueFromBidDatas(BidDataValue_1.BidDataValue.BUYER_CHANGE_ADDRESS, bid.BidDatas); // TODO: Error handling - nice messagee..
            this.log.debug('sellerEscrowPubAddress: ', sellerEscrowPubAddress);
            this.log.debug('sellerEscrowChangeAddress: ', sellerEscrowChangeAddress);
            // 0.16.0.3
            // const sellerEscrowPubAddressInformation = await this.coreRpcService.validateAddress(sellerEscrowPubAddress);
            // const sellerEscrowPubAddressPublicKey = sellerEscrowPubAddressInformation.pubkey;
            // 0.17++ ...
            const sellerEscrowPubAddressInformation = yield this.coreRpcService.getAddressInfo(sellerEscrowPubAddress);
            const sellerEscrowPubAddressPublicKey = sellerEscrowPubAddressInformation.pubkey;
            const buyerEscrowPubAddressPublicKey = this.getValueFromBidDatas(BidDataValue_1.BidDataValue.BUYER_PUBKEY, bid.BidDatas);
            // create multisig escrow address
            // escrowMultisigAddress:  0=[{
            //   "address": "rU71DNgoAj7W6e1aQqALk66HXrUpuEbERH",
            //   "redeemScript": "522102b3d88...c52ae"
            // }]
            // todo: replace '_escrow_' + listingItem.hash with something unique
            const escrowMultisigAddress = yield this.coreRpcService.addMultiSigAddress(2, [sellerEscrowPubAddressPublicKey, buyerEscrowPubAddressPublicKey].sort(), '_escrow_' + listingItem.hash);
            // txout: {
            //   escrowAddress: amount that should be escrowed
            //   sellerEscrowChangeAddress: sellers change amount
            //   buyerEscrowChangeAddress: buyers change amount
            // }
            const txout = yield this.createTxOut(escrowMultisigAddress.address, sellerEscrowChangeAddress, buyerEscrowChangeAddress, sellerSelectedOutputData, buyerSelectedOutputData, sellerEscrowPubAddressPublicKey, buyerEscrowPubAddressPublicKey, totalPrice, listingItem.hash);
            const txInputs = buyerSelectedOutputData.outputs.concat(sellerSelectedOutputData.outputs);
            const rawtx = yield this.coreRpcService.createRawTransaction(txInputs, txout);
            this.log.debug('MPA_ACCEPT, txInputs: ', JSON.stringify(txInputs, null, 2));
            this.log.debug('MPA_ACCEPT, txout: ', JSON.stringify(txout, null, 2));
            this.log.debug('MPA_ACCEPT, rawtx: ', JSON.stringify(rawtx, null, 2));
            // 0.16.0.3
            // const signed = await this.coreRpcService.signRawTransaction(rawtx);
            // this.log.debug('signed: ', JSON.stringify(signed, null, 2));
            // 0.17++
            // if (Environment.isDevelopment() || Environment.isTest()) {
            //    const privKey = await this.coreRpcService.dumpPrivKey(addr);
            //    signed = await this.coreRpcService.signRawTransactionWithKey(rawtx, [privKey]);
            // } else {
            const signed = yield this.coreRpcService.signRawTransactionWithWallet(rawtx);
            // }
            this.log.info('===========================================================================');
            this.log.info('signed: ', JSON.stringify(signed, null, 2));
            this.log.info('===========================================================================');
            // TODO: duplicate code, use the same signRawTx function as in EscrowActionService
            if (!signed || (signed.errors && (signed.errors[0].error !== 'Operation not valid with the current stack size' &&
                signed.errors[0].error !== 'Unable to sign input, invalid stack size (possibly missing key)'))) {
                this.log.error('Error signing transaction' + signed ? ': ' + signed.errors[0].error : '');
                throw new MessageException_1.MessageException('Error signing transaction' + signed ? ': ' + signed.error : '');
            }
            if (signed.complete) {
                this.log.error('Transaction should not be complete at this stage, will not send insecure message');
                throw new MessageException_1.MessageException('Transaction should not be complete at this stage, will not send insecure message');
            }
            const bidDatas = this.getIdValuePairsFromArray([
                BidDataValue_1.BidDataValue.SELLER_OUTPUTS, sellerSelectedOutputData.outputs,
                BidDataValue_1.BidDataValue.BUYER_OUTPUTS, buyerSelectedOutputData.outputs,
                // 'pubkeys', [sellerEscrowPubAddressPublicKey, buyerEcrowPubAddressPublicKey].sort(),
                BidDataValue_1.BidDataValue.SELLER_PUBKEY, sellerEscrowPubAddressPublicKey,
                BidDataValue_1.BidDataValue.BUYER_PUBKEY, buyerEscrowPubAddressPublicKey,
                BidDataValue_1.BidDataValue.RAW_TX, signed.hex
            ]);
            this.log.debug('bidDatas: ', JSON.stringify(bidDatas, null, 2));
            return bidDatas;
        });
    }
    /**
     *
     * @param {string} escrowMultisigAddress
     * @param {string} sellerEscrowChangeAddress
     * @param {string} buyerEscrowChangeAddress
     * @param {OutputData} sellerSelectedOutputData
     * @param {OutputData} buyerSelectedOutputData
     * @param {string} sellerEscrowPubAddressPublicKey
     * @param {string} buyerEscrowPubAddressPublicKey
     * @param {number} itemTotalPrice
     * @param {string} listingItemHash
     * @returns {any}
     */
    createTxOut(escrowMultisigAddress, sellerEscrowChangeAddress, buyerEscrowChangeAddress, sellerSelectedOutputData, buyerSelectedOutputData, sellerEscrowPubAddressPublicKey, buyerEscrowPubAddressPublicKey, itemTotalPrice, listingItemHash) {
        // txout: {
        //   escrowMultisigAddress: amount that should be escrowed
        //   sellerEscrowChangeAddress: sellers change amount
        //   buyerEscrowChangeAddress: buyers change amount
        // }
        const txout = {};
        this.log.debug('sellerEscrowPubAddressPublicKey: ', sellerEscrowPubAddressPublicKey);
        this.log.debug('buyerEcrowPubAddressPublicKey: ', buyerEscrowPubAddressPublicKey);
        this.log.debug('listingItem.hash: ', listingItemHash);
        txout[escrowMultisigAddress] = +(itemTotalPrice * 3).toFixed(8); // TODO: Shipping... ;(
        txout[sellerEscrowChangeAddress] = sellerSelectedOutputData.outputsChangeAmount;
        txout[buyerEscrowChangeAddress] = buyerSelectedOutputData.outputsChangeAmount;
        // this.log.debug('buyerOutputs: ', JSON.stringify(buyerSelectedOutputData.outputs, null, 2));
        // TODO: Verify that buyers outputs are unspent?? :/
        // TODO: Refactor reusable logic. and verify / validate buyer change.
        if (!_.isEmpty(buyerSelectedOutputData.outputs)) {
            let buyerOutputsSum = 0;
            let buyerOutputsChangeAmount = 0;
            buyerSelectedOutputData.outputs.forEach(output => {
                const amount = output.amount || 0;
                buyerOutputsSum += amount;
                if (buyerOutputsSum > itemTotalPrice * 2) {
                    buyerOutputsChangeAmount = +(buyerOutputsSum - (itemTotalPrice * 2) - 0.0001).toFixed(8); // TODO: Get actual fee...
                    return;
                }
            });
            // todo: calculate buyers requiredAmount from Ratio
            // check that buyers outputs contain enough funds
            if (buyerOutputsSum < itemTotalPrice * 2) {
                this.log.warn('Buyers outputs do not contain enough funds!');
                throw new MessageException_1.MessageException('Buyers outputs do not contain enough funds!');
            }
            txout[buyerEscrowChangeAddress] = buyerSelectedOutputData.outputsChangeAmount;
        }
        else {
            this.log.error('Buyer didn\'t supply outputs!');
            throw new MessageException_1.MessageException('Buyer didn\'t supply outputs!'); // TODO: proper message for no outputs :P
        }
        // TODO: Decide if we want this on the blockchain or not...
        // TODO: Think about how to recover escrow information to finalize transactions should client pc / database crash..
        //
        // txout['data'] = unescape(encodeURIComponent(data.params[0]))
        //    .split('').map(v => v.charCodeAt(0).toString(16)).join('').substr(0, 80);
        //
        return txout;
    }
    /**
     * Cancel a Bid
     *
     * @param {module:resources.Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    cancel(bid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (bid.action === BidMessageType_1.BidMessageType.MPA_BID) {
                const listingItem = yield this.listingItemService.findOne(bid.ListingItem.id, true)
                    .then(value => {
                    return value.toJSON();
                });
                // create the bid cancel message
                const bidMessage = yield this.bidFactory.getMessage(BidMessageType_1.BidMessageType.MPA_CANCEL, listingItem.hash);
                // Update the bid in the database with new action.
                const tmpBidCreateRequest = yield this.bidFactory.getModel(bidMessage, listingItem.id, bid.bidder, bid);
                const bidUpdateRequest = {
                    listing_item_id: tmpBidCreateRequest.listing_item_id,
                    action: BidMessageType_1.BidMessageType.MPA_CANCEL,
                    bidder: tmpBidCreateRequest.bidder,
                    bidDatas: tmpBidCreateRequest.bidDatas
                };
                yield this.bidService.update(bid.id, bidUpdateRequest);
                const marketPlaceMessage = {
                    version: process.env.MARKETPLACE_VERSION,
                    mpaction: bidMessage
                };
                this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);
                // remove buyers lockedoutputs
                let selectedOutputs = this.getValueFromBidDatas(BidDataValue_1.BidDataValue.BUYER_OUTPUTS, bid.BidDatas);
                selectedOutputs = selectedOutputs[0] === '[' ? JSON.parse(selectedOutputs) : selectedOutputs;
                yield this.lockedOutputService.destroyLockedOutputs(selectedOutputs);
                const success = yield this.lockedOutputService.unlockOutputs(selectedOutputs);
                if (success) {
                    // broadcast the cancel bid message
                    return yield this.smsgService.smsgSend(bid.bidder, listingItem.seller, marketPlaceMessage, false);
                }
                else {
                    throw new MessageException_1.MessageException('Failed to unlock the locked outputs.');
                }
            }
            else {
                this.log.error(`Bid can not be cancelled because it was already been ${bid.action}`);
                throw new MessageException_1.MessageException(`Bid can not be cancelled because it was already been ${bid.action}`);
            }
        });
    }
    /**
     * Reject a Bid
     * todo: add the bid as param, so we know whose bid we are rejecting. now supports just one bidder.
     *
     * @param {module:resources.Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    reject(bid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (bid.action === BidMessageType_1.BidMessageType.MPA_BID) {
                const listingItem = yield this.listingItemService.findOne(bid.ListingItem.id, true)
                    .then(value => {
                    return value.toJSON();
                });
                // fetch the seller profile
                const sellerProfileModel = yield this.profileService.findOneByAddress(listingItem.seller);
                if (!sellerProfileModel) {
                    this.log.error('Seller profile not found. We aren\'t the seller?');
                    throw new MessageException_1.MessageException('Seller profile not found. We aren\'t the seller?');
                }
                const sellerProfile = sellerProfileModel.toJSON();
                // create the bid reject message
                const bidMessage = yield this.bidFactory.getMessage(BidMessageType_1.BidMessageType.MPA_REJECT, listingItem.hash);
                // Update the bid in the database with new action.
                const tmpBidCreateRequest = yield this.bidFactory.getModel(bidMessage, listingItem.id, bid.bidder, bid);
                const bidUpdateRequest = {
                    listing_item_id: tmpBidCreateRequest.listing_item_id,
                    action: BidMessageType_1.BidMessageType.MPA_REJECT,
                    bidder: tmpBidCreateRequest.bidder,
                    bidDatas: tmpBidCreateRequest.bidDatas
                };
                yield this.bidService.update(bid.id, bidUpdateRequest);
                const marketPlaceMessage = {
                    version: process.env.MARKETPLACE_VERSION,
                    mpaction: bidMessage
                };
                this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);
                // broadcast the reject bid message
                return yield this.smsgService.smsgSend(sellerProfile.address, bid.bidder, marketPlaceMessage, false);
            }
            else {
                this.log.error(`Bid can not be rejected because it was already been ${bid.action}`);
                throw new MessageException_1.MessageException(`Bid can not be rejected because it was already been ${bid.action}`);
            }
        });
    }
    /**
     * process received BidMessage
     * - save ActionMessage
     * - create Bid
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    processBidReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bidMessage = event.marketplaceMessage.mpaction;
            const bidder = event.smsgMessage.from;
            const message = event.marketplaceMessage;
            if (!message.mpaction || !message.mpaction.item) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            return yield this.listingItemService.findOneByHash(message.mpaction.item)
                .then((listingItemModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const listingItem = listingItemModel.toJSON();
                // todo: check that the listingitem is yours
                // first save actionmessage
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                // TODO: should someone be able to bid more than once?
                // TODO: for that to be possible, we need to be able to identify different bids from one address
                // -> needs bid.hash
                // TODO: when testing locally, bid gets created first for the bidder after which it can be found here when receiving the bid
                const biddersExistingBidsForItem = yield this.bidService.search({
                    listingItemHash: bidMessage.item,
                    bidders: [bidder]
                });
                if (biddersExistingBidsForItem && biddersExistingBidsForItem.length > 0) {
                    this.log.debug('biddersExistingBidsForItem:', JSON.stringify(biddersExistingBidsForItem, null, 2));
                    throw new MessageException_1.MessageException('Bids allready exist for the ListingItem for the bidder.');
                }
                if (bidMessage) {
                    const createdBid = yield this.createBid(bidMessage, listingItem, bidder);
                    // this.log.debug('createdBid:', JSON.stringify(createdBid, null, 2));
                    // TODO: do whatever else needs to be done
                    return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
                }
                else {
                    throw new MessageException_1.MessageException('Missing BidMessage');
                }
            }))
                .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
            });
        });
    }
    /**
     * process received AcceptBidMessage
     * - save ActionMessage
     * - update Bid
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    processAcceptBidReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bidMessage = event.marketplaceMessage.mpaction;
            const bidder = event.smsgMessage.to; // from seller to buyer
            // find the ListingItem
            const message = event.marketplaceMessage;
            if (!message.mpaction || !message.mpaction.item) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            return yield this.listingItemService.findOneByHash(message.mpaction.item)
                .then((listingItemModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const listingItem = listingItemModel.toJSON();
                // TODO: save incoming and outgoing actionmessages
                // TODO: ... and do it in one place
                // first save it
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                if (bidMessage) {
                    // find the Bid
                    const existingBid = _.find(listingItem.Bids, (o) => {
                        return o.action === BidMessageType_1.BidMessageType.MPA_BID && o.bidder === bidder;
                    });
                    // this.log.debug('existingBid:', JSON.stringify(existingBid, null, 2));
                    if (existingBid) {
                        // update the bid locally
                        const bidUpdateRequest = yield this.bidFactory.getModel(bidMessage, listingItem.id, bidder, existingBid);
                        // this.log.debug('bidUpdateRequest:', JSON.stringify(bidUpdateRequest, null, 2));
                        const updatedBidModel = yield this.bidService.update(existingBid.id, bidUpdateRequest);
                        let updatedBid = updatedBidModel.toJSON();
                        // this.log.debug('updatedBid:', JSON.stringify(updatedBid, null, 2));
                        // create the order from the bid
                        const orderCreateRequest = yield this.orderFactory.getModelFromBid(updatedBid);
                        const orderModel = yield this.orderService.create(orderCreateRequest);
                        const order = orderModel.toJSON();
                        this.log.debug('processAcceptBidReceivedEvent(), created Order: ', JSON.stringify(order, null, 2));
                        const orderHash = this.getValueFromBidDatas(BidDataValue_1.BidDataValue.ORDER_HASH, updatedBid.BidDatas);
                        this.log.debug('seller orderHash: ', orderHash);
                        this.log.debug('local orderHash: ', order.hash);
                        if (orderHash !== order.hash) {
                            throw new MessageException_1.MessageException('Created Order.hash does not match with the received orderHash.');
                        }
                        yield updatedBidModel.fetch({ withRelated: ['OrderItem'] });
                        updatedBid = updatedBidModel.toJSON();
                        // TODO: do whatever else needs to be done
                        // this.log.debug('processAcceptBidReceivedEvent(), updatedBid: ', JSON.stringify(updatedBid, null, 2));
                        return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
                    }
                    else {
                        return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
                    }
                }
                else {
                    throw new MessageException_1.MessageException('Missing BidMessage.');
                }
            }))
                .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
            });
        });
    }
    /**
     * process received CancelBidMessage
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.ActionMessage>}
     */
    processCancelBidReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bidMessage = event.marketplaceMessage.mpaction;
            const bidder = event.smsgMessage.from;
            // find the ListingItem
            const message = event.marketplaceMessage;
            if (!message.mpaction || !message.mpaction.item) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            return yield this.listingItemService.findOneByHash(message.mpaction.item)
                .then((listingItemModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const listingItem = listingItemModel.toJSON();
                // first save it
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                // Get latest bid from listingItemId and bidder so we can get bidId.
                const params = new BidSearchParams_1.BidSearchParams({
                    listingItemId: listingItem.id,
                    action: BidMessageType_1.BidMessageType.MPA_BID,
                    bidders: [bidder],
                    ordering: SearchOrder_1.SearchOrder.DESC
                });
                // TODO: oldBids.pop() does not return anything. this wont work.
                const oldBids = yield this.bidService.search(params);
                let oldBid = oldBids.pop();
                if (!oldBid) {
                    this.log.error('Missing old bid.');
                    return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
                }
                oldBid = oldBid.toJSON();
                // Update the bid in the database with new action.
                const tmpBidCreateRequest = yield this.bidFactory.getModel(bidMessage, listingItem.id, bidder, oldBid);
                const bidUpdateRequest = {
                    listing_item_id: tmpBidCreateRequest.listing_item_id,
                    action: BidMessageType_1.BidMessageType.MPA_CANCEL,
                    bidder: tmpBidCreateRequest.bidder,
                    bidDatas: tmpBidCreateRequest.bidDatas
                };
                const updatedBid = yield this.bidService.update(oldBid.id, bidUpdateRequest);
                return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
            }))
                .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
            });
        });
    }
    /**
     * process received RejectBidMessage
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.ActionMessage>}
     */
    processRejectBidReceivedEvent(event) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const message = event.marketplaceMessage;
            const bidMessage = message.mpaction;
            const bidder = event.smsgMessage.to;
            // find the ListingItem
            if (!bidMessage) {
                throw new MessageException_1.MessageException('Missing mpaction.');
            }
            return yield this.listingItemService.findOneByHash(bidMessage.item)
                .then((listingItemModel) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const listingItem = listingItemModel.toJSON();
                // first save it
                const actionMessageModel = yield this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();
                // Get latest bid from listingItemId and bidder so we can get bidId.
                const params = new BidSearchParams_1.BidSearchParams({
                    listingItemId: listingItem.id,
                    action: BidMessageType_1.BidMessageType.MPA_BID,
                    bidders: [bidder],
                    ordering: SearchOrder_1.SearchOrder.DESC
                });
                const oldBids = yield this.bidService.search(params);
                // TODO: oldBids.pop() does not return anything. this wont work.
                let oldBid = oldBids.pop();
                if (!oldBid) {
                    throw new MessageException_1.MessageException('Missing old bid.');
                }
                oldBid = oldBid.toJSON();
                // Update the bid in the database with new action.
                const tmpBidCreateRequest = yield this.bidFactory.getModel(bidMessage, listingItem.id, bidder, oldBid);
                const bidUpdateRequest = {
                    listing_item_id: tmpBidCreateRequest.listing_item_id,
                    action: BidMessageType_1.BidMessageType.MPA_REJECT,
                    bidder: tmpBidCreateRequest.bidder,
                    bidDatas: tmpBidCreateRequest.bidDatas
                };
                const bidModel = yield this.bidService.update(oldBid.id, bidUpdateRequest);
                const bid = bidModel.toJSON();
                // remove buyers lockedoutputs
                let selectedOutputs = this.getValueFromBidDatas(BidDataValue_1.BidDataValue.BUYER_OUTPUTS, bid.BidDatas);
                selectedOutputs = selectedOutputs[0] === '[' ? JSON.parse(selectedOutputs) : selectedOutputs;
                yield this.lockedOutputService.destroyLockedOutputs(selectedOutputs);
                const success = yield this.lockedOutputService.unlockOutputs(selectedOutputs);
                if (success) {
                    return SmsgMessageStatus_1.SmsgMessageStatus.PROCESSED;
                }
                else {
                    throw new MessageException_1.MessageException('Failed to unlock the locked outputs.');
                }
            }))
                .catch(reason => {
                return SmsgMessageStatus_1.SmsgMessageStatus.WAITING;
            });
        });
    }
    /**
     *
     * todo: should be moved to util or we should combine the bid and escrowactionservices
     * @param {string[]} data
     * data[]:
     * [0]: id, string
     * [1]: value, string
     * [2]: id, string
     * [3]: value, string
     *
     * @param {any[]} data
     * @returns {IdValuePair[]}
     */
    getIdValuePairsFromArray(data) {
        const idValuePairs = [];
        // convert the bid data params as idValuePairs array
        for (let i = 0; i < data.length; i += 2) {
            idValuePairs.push({ id: data[i], value: data[i + 1] });
        }
        return idValuePairs;
    }
    /**
     *
     * todo: should be moved to util or we should combine the bid and escrowactionservices
     * @param {string} key
     * @param {module:resources.BidData[]} bidDatas
     * @returns {any}
     */
    getValueFromBidDatas(key, bidDatas) {
        const value = bidDatas.find(kv => kv.dataId === key);
        if (value) {
            return value.dataValue;
        }
        else {
            this.log.error('Missing BidData value for key: ' + key);
            throw new MessageException_1.MessageException('Missing BidData value for key: ' + key);
        }
    }
    createBid(bidMessage, listingItem, bidder) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // create a bid
            const bidCreateRequest = yield this.bidFactory.getModel(bidMessage, listingItem.id, bidder);
            // make sure the bids address type is correct
            this.log.debug('found listingItem.id: ', listingItem.id);
            if (!_.isEmpty(listingItem.ListingItemTemplate)) {
                this.log.debug('listingItem has template: ', listingItem.ListingItemTemplate.id);
                this.log.debug('listingItem template has profile: ', listingItem.ListingItemTemplate.Profile.id);
                bidCreateRequest.address.type = AddressType_1.AddressType.SHIPPING_BID;
                bidCreateRequest.address.profile_id = listingItem.ListingItemTemplate.Profile.id;
            }
            else {
                this.log.debug('listingItem has no template ');
                this.log.debug('bidder: ', bidder);
                const profileModel = yield this.profileService.findOneByAddress(bidder);
                const profile = profileModel.toJSON();
                bidCreateRequest.address.type = AddressType_1.AddressType.SHIPPING_BID;
                bidCreateRequest.address.profile_id = profile.id;
            }
            const createdBidModel = yield this.bidService.create(bidCreateRequest);
            const createdBid = createdBidModel.toJSON();
            return createdBid;
        });
    }
    /**
     * get seller from listingitems MP_ITEM_ADD ActionMessage
     * todo:  refactor
     * @param {"resources".ListingItem} listingItem
     * @returns {Promise<string>}
     */
    getBuyer(listingItem) {
        for (const actionMessage of listingItem.ActionMessages) {
            if (actionMessage.action === 'MPA_BID') {
                return actionMessage.MessageData.from;
            }
        }
        throw new MessageException_1.MessageException('Buyer not found for ListingItem.');
    }
    configureEventListeners() {
        this.log.info('Configuring EventListeners ');
        this.eventEmitter.on(constants_1.Events.BidReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processBidReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.error('ERROR: BidReceivedMessage processing failed.', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING_FAILED);
            }));
        }));
        this.eventEmitter.on(constants_1.Events.AcceptBidReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processAcceptBidReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.error('ERROR: BidAcceptMessage processing failed.', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING_FAILED);
            }));
        }));
        this.eventEmitter.on(constants_1.Events.CancelBidReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processCancelBidReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.error('ERROR: BidCancelMessage processing failed.', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING_FAILED);
            }));
        }));
        this.eventEmitter.on(constants_1.Events.RejectBidReceivedEvent, (event) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            yield this.processRejectBidReceivedEvent(event)
                .then((status) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
            }))
                .catch((reason) => tslib_1.__awaiter(this, void 0, void 0, function* () {
                this.log.error('ERROR: BidRejectMessage processing failed.', reason);
                yield this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus_1.SmsgMessageStatus.PROCESSING_FAILED);
            }));
        }));
    }
    /**
     * Convenience util to correct unwanted precision errors in numbers.
     * (particularly after number arithmetic)
     *
     * @param {number} n
     * @returns {number}
     */
    correctNumberDecimals(n) {
        return Number.parseFloat(n.toFixed(8));
    }
};
BidActionService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.ActionMessageService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.SmsgService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.BidService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.BidDataService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Service.OrderService)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Service.LockedOutputService)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(10, inversify_1.named(constants_1.Targets.Service.SmsgMessageService)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(11, inversify_1.named(constants_1.Targets.Factory.BidFactory)),
    tslib_1.__param(12, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(12, inversify_1.named(constants_1.Targets.Factory.OrderFactory)),
    tslib_1.__param(13, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(13, inversify_1.named(constants_1.Core.Events)),
    tslib_1.__param(14, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(14, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ListingItemService_1.ListingItemService,
        MarketService_1.MarketService,
        ActionMessageService_1.ActionMessageService,
        ProfileService_1.ProfileService,
        SmsgService_1.SmsgService,
        BidService_1.BidService,
        BidDataService_1.BidDataService,
        OrderService_1.OrderService,
        CoreRpcService_1.CoreRpcService,
        LockedOutputService_1.LockedOutputService,
        SmsgMessageService_1.SmsgMessageService,
        BidFactory_1.BidFactory,
        OrderFactory_1.OrderFactory,
        events_1.EventEmitter, Object])
], BidActionService);
exports.BidActionService = BidActionService;
//# sourceMappingURL=BidActionService.js.map