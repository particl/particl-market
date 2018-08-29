// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets, Events } from '../../constants';
import * as resources from 'resources';
import { MessageException } from '../exceptions/MessageException';
import { MarketplaceEvent } from '../messages/MarketplaceEvent';
import { EventEmitter } from 'events';
import { ActionMessageService } from './ActionMessageService';
import { BidService } from './BidService';
import { ProfileService } from './ProfileService';
import { MarketService } from './MarketService';
import { BidFactory } from '../factories/BidFactory';
import { SmsgService } from './SmsgService';
import { CoreRpcService } from './CoreRpcService';
import { ListingItemService } from './ListingItemService';
import { SmsgSendResponse } from '../responses/SmsgSendResponse';
import { Profile } from '../models/Profile';
import { MarketplaceMessage } from '../messages/MarketplaceMessage';
import { BidMessageType } from '../enums/BidMessageType';
import { Output } from 'resources';
import { BidMessage } from '../messages/BidMessage';
import { BidSearchParams } from '../requests/BidSearchParams';
import { AddressType } from '../enums/AddressType';
import { SearchOrder } from '../enums/SearchOrder';
import { BidUpdateRequest } from '../requests/BidUpdateRequest';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import { Bid } from '../models/Bid';
import { OrderFactory } from '../factories/OrderFactory';
import { OrderService } from './OrderService';
import { BidDataService } from './BidDataService';
import { BidDataCreateRequest } from '../requests/BidDataCreateRequest';
import { LockedOutputService } from './LockedOutputService';
import { BidDataValue } from '../enums/BidDataValue';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';
import { SmsgMessageService } from './SmsgMessageService';

// todo: move
export interface OutputData {
    outputs: Output[];
    outputsSum: number;
    outputsChangeAmount: number;
}

// todo: move
export interface IdValuePair {
    id: string;
    value: any;
}

export class BidActionService {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.MarketService) private marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) private actionMessageService: ActionMessageService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) private profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.SmsgService) private smsgService: SmsgService,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.BidDataService) private bidDataService: BidDataService,
        @inject(Types.Service) @named(Targets.Service.OrderService) private orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
        @inject(Types.Service) @named(Targets.Service.LockedOutputService) private lockedOutputService: LockedOutputService,
        @inject(Types.Service) @named(Targets.Service.SmsgMessageService) private smsgMessageService: SmsgMessageService,
        @inject(Types.Factory) @named(Targets.Factory.BidFactory) private bidFactory: BidFactory,
        @inject(Types.Factory) @named(Targets.Factory.OrderFactory) private orderFactory: OrderFactory,
        @inject(Types.Core) @named(Core.Events) private eventEmitter: EventEmitter,
        @inject(Types.Core) @named(Core.Logger) private Logger: typeof LoggerType
    ) {
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
    public async send(listingItem: resources.ListingItem, bidderProfile: resources.Profile,
                      additionalParams: IdValuePair[]): Promise<SmsgSendResponse> {

        // TODO: change send params to BidSendRequest and @validate them
        // TODO: some of this stuff could propably be moved to the factory
        // TODO: Create new unspent RPC call for unspent outputs that came out of a RingCT transaction

        // generate bidDatas for the message
        const bidDatas = await this.generateBidDatasForMPA_BID(listingItem, additionalParams);

        // this.log.debug('bidder profile: ', JSON.stringify(bidderProfile, null, 2));

        // create MPA_BID message
        const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_BID, listingItem.hash, bidDatas);

        const marketPlaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            mpaction: bidMessage
        } as MarketplaceMessage;

        this.log.debug('send(), marketPlaceMessage: ', JSON.stringify(marketPlaceMessage, null, 2));

        // save bid locally before broadcasting
        const createdBid: resources.Bid = await this.createBid(bidMessage, listingItem, bidderProfile.address);
        // this.log.debug('createdBid:', JSON.stringify(createdBid, null, 2));

        // store the selected outputs, so we can load and lock them again on mp restart
        let selectedOutputs = this.getValueFromBidDatas(BidDataValue.BUYER_OUTPUTS, createdBid.BidDatas);
        selectedOutputs = selectedOutputs[0] === '[' ? JSON.parse(selectedOutputs) : selectedOutputs;

        const createdLockedOutputs = await this.lockedOutputService.createLockedOutputs(selectedOutputs, createdBid.id);
        const success = await this.lockedOutputService.lockOutputs(createdLockedOutputs);

        if (success) {
            // broadcast the message to the network
            return await this.smsgService.smsgSend(bidderProfile.address, listingItem.seller, marketPlaceMessage, false);
        } else {
            throw new MessageException('Failed to lock the selected outputs.');
        }
    }

    /**
     * generate the required biddatas for MPA_BID message
     *
     * @param {module:resources.ListingItem} listingItem
     * @param {any[]} additionalParams
     * @returns {Promise<IdValuePair[]>}
     */
    public async generateBidDatasForMPA_BID(
        listingItem: resources.ListingItem,
        additionalParams: IdValuePair[]
    ): Promise<IdValuePair[]> {

        // todo: propably something that we should check earlier
        // todo: and we shouldnt even be having items without a price at the moment, validation before posting should take care of that
        // todo: this could also be caused by of some other error, while saving the item
        if (!listingItem.PaymentInformation.ItemPrice || !listingItem.PaymentInformation.ItemPrice.basePrice) {
            this.log.warn(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
            throw new MessageException(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
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
        const buyerSelectedOutputData: OutputData = await this.findUnspentOutputs(requiredAmount);

        // changed to getNewAddress, since getaccountaddress doesn't return address which we can get the pubkey from
        const buyerEscrowPubAddress = await this.coreRpcService.getNewAddress(['_escrow_pub_' + listingItem.hash], false);
        const buyerEscrowChangeAddress = await this.coreRpcService.getNewAddress(['_escrow_change'], false);

        this.log.debug('buyerEscrowPubAddress: ', buyerEscrowPubAddress);
        this.log.debug('buyerEscrowChangeAddress: ', buyerEscrowChangeAddress);

        // 0.16.0.3
        // const buyerEscrowPubAddressInformation = await this.coreRpcService.validateAddress(buyerEscrowPubAddress);
        // const buyerEcrowPubAddressPublicKey = buyerEscrowPubAddressInformation.pubkey;

        // 0.17++ ...
        const buyerEscrowPubAddressInformation = await this.coreRpcService.getAddressInfo(buyerEscrowPubAddress);
        const buyerEcrowPubAddressPublicKey = buyerEscrowPubAddressInformation.pubkey;

        this.log.debug('buyerEscrowPubAddressInformation: ', JSON.stringify(buyerEscrowPubAddressInformation, null, 2));

        if (!buyerEcrowPubAddressPublicKey) {
            throw new MessageException('Could not get public key for buyerEscrowPubAddress!');
        }

        // TODO: We need to send a refund / release address
        // TODO: address should be named releaseAddress or sellerReleaseAddress and all keys should be enums,
        // it's confusing when on escrowactionservice this 'address' is referred to as sellers address which it is not
        const buyerEscrowReleaseAddress = await this.coreRpcService.getNewAddress(['_escrow_release'], false);

        // convert the bid data params as bid data key value pair
        // todo: refactor to use resources.BidData instead of this IdValuePair
        const bidDatas = this.getIdValuePairsFromArray([
            BidDataValue.BUYER_OUTPUTS, buyerSelectedOutputData.outputs,
            BidDataValue.BUYER_PUBKEY, buyerEcrowPubAddressPublicKey,
            BidDataValue.BUYER_CHANGE_ADDRESS, buyerEscrowChangeAddress,
            BidDataValue.BUYER_CHANGE_AMOUNT, buyerSelectedOutputData.outputsChangeAmount,
            BidDataValue.BUYER_RELEASE_ADDRESS, buyerEscrowReleaseAddress
        ]).concat(additionalParams);

        // this.log.debug('bidDatas: ', JSON.stringify(bidDatas, null, 2));

        return bidDatas;
    }

    /**
     * find unspent outputs for the required amount
     *
     * @param {number} requiredAmount
     * @returns {Promise<any>}
     */
    public async findUnspentOutputs(requiredAmount: number): Promise<OutputData> {

        // get all unspent transaction outputs
        const unspentOutputs = await this.coreRpcService.listUnspent(1, 99999999, [], false);

        if (!unspentOutputs || unspentOutputs.length === 0) {
            this.log.warn('No unspent outputs');
            throw new MessageException('No unspent outputs');
        }

        this.log.debug('unspent outputs amount: ', unspentOutputs.length);

        const selectedOutputs: Output[] = [];
        let selectedOutputsSum = 0;
        let selectedOutputsChangeAmount = 0;

        unspentOutputs.find(output => {
            if (output.spendable && output.solvable) {
                selectedOutputsSum += output.amount;
                selectedOutputs.push({
                    txid: output.txid,
                    vout: output.vout,
                    amount: output.amount
                });
            }

            // todo: get the actual fee
            // check whether we have collected enough outputs to pay for the item and
            // calculate the change amount
            // requiredAmount, for MPA_BID: (totalPrice * 2)
            // requiredAmount, for MPA_ACCEPT: totalPrice

            if (selectedOutputsSum > requiredAmount) {
                selectedOutputsChangeAmount = +(selectedOutputsSum - requiredAmount - 0.0002).toFixed(8);
                return true;
            }
            return false;
        });

        if (selectedOutputsSum < requiredAmount) {
            this.log.warn('Not enough funds');
            throw new MessageException('Not enough funds');
        }

        // todo: type
        const response: OutputData = {
            outputs: selectedOutputs,
            outputsSum: selectedOutputsSum,
            outputsChangeAmount: selectedOutputsChangeAmount
        };

        this.log.debug('selected outputs:', JSON.stringify(response, null, 2));

        return response;
    }


    /**
     * Accept a Bid
     *
     * @param {module:resources.ListingItem} listingItem
     * @param {module:resources.Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    public async accept(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse> {

        // previous bids action needs to be MPA_BID
        if (bid.action === BidMessageType.MPA_BID) {

            // todo: create order before biddatas so order hash can be added to biddata in generateBidDatasForMPA_ACCEPT
            // generate bidDatas for MPA_ACCEPT
            const bidDatas: IdValuePair[] = await this.generateBidDatasForMPA_ACCEPT(listingItem, bid);

            // create the bid accept message using the generated bidDatas
            const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_ACCEPT, listingItem.hash, bidDatas);
            // this.log.debug('accept(), created bidMessage (MPA_ACCEPT):', JSON.stringify(bidMessage, null, 2));

            // update the bid locally
            const bidUpdateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bid.bidder, bid);
            const updatedBidModel = await this.bidService.update(bid.id, bidUpdateRequest);
            const updatedBid = updatedBidModel.toJSON();
            // this.log.debug('accept(), updatedBid:', JSON.stringify(updatedBid, null, 2));

            // create the order
            const orderCreateRequest = await this.orderFactory.getModelFromBid(updatedBid);
            const orderModel = await this.orderService.create(orderCreateRequest);
            const order = orderModel.toJSON();

            this.log.debug('accept(), created Order: ', JSON.stringify(order, null, 2));
            // this.log.debug('accept(), created bidMessage.objects: ', bidMessage.objects);

            // put the order.hash in BidMessage and also save it
            // todo: this is here because bidMessage.objects 'possibly undefined', which it never really should be
            if (!bidMessage.objects) {
                bidMessage.objects = [];
            }
            bidMessage.objects.push({id: BidDataValue.ORDER_HASH, value: order.hash});

            // TODO: clean this up, so that we can add this with bidService.update
            const orderHashBidData = await this.bidDataService.create({
                bid_id: updatedBid.id,
                dataId: BidDataValue.ORDER_HASH.toString(),
                dataValue: order.hash
            } as BidDataCreateRequest);

            // this.log.debug('accept(), updatedBid.id: ', updatedBid.id);
            // this.log.debug('accept(), order.hash: ', order.hash);
            // this.log.debug('accept(), added orderHash to bidData: ', orderHashBidData.toJSON());

            // store the sellers selected outputs in db, so we can load and lock them again on mp restart
            let selectedOutputs = this.getValueFromBidDatas(BidDataValue.SELLER_OUTPUTS, updatedBid.BidDatas);
            selectedOutputs = selectedOutputs[0] === '[' ? JSON.parse(selectedOutputs) : selectedOutputs;
            const createdLockedOutputs = await this.lockedOutputService.createLockedOutputs(selectedOutputs, bid.id);
            const success = await this.lockedOutputService.lockOutputs(createdLockedOutputs);

            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            } as MarketplaceMessage;

            if (success) {
                // broadcast the MPA_ACCEPT message
                this.log.debug('send(), marketPlaceMessage: ', JSON.stringify(marketPlaceMessage, null, 2));
                return await this.smsgService.smsgSend(listingItem.seller, updatedBid.bidder, marketPlaceMessage, false);
            } else {
                throw new MessageException('Failed to lock the selected outputs.');
            }

        } else {
            this.log.error(`Bid can not be accepted because its state allready is ${bid.action}`);
            throw new MessageException(`Bid can not be accepted because its state already is ${bid.action}`);
        }
    }

    /**
     * generate the required biddatas for MPA_ACCEPT message
     *
     * @param {module:resources.ListingItem} listingItem
     * @param {module:resources.Bid} bid
     * @returns {Promise<any[]>}
     */
    public async generateBidDatasForMPA_ACCEPT(
        listingItem: resources.ListingItem,
        bid: resources.Bid
    ): Promise<IdValuePair[]> {

        if (_.isEmpty(listingItem.PaymentInformation.ItemPrice)) {
            this.log.warn(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
            throw new MessageException(`ListingItem with the hash=${listingItem.hash} does not have a price!`);
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
        const sellerSelectedOutputData: OutputData = await this.findUnspentOutputs(requiredAmount);

        // create OutputData for buyer
        const buyerSelectedOutputs: Output[] = JSON.parse(this.getValueFromBidDatas(BidDataValue.BUYER_OUTPUTS, bid.BidDatas));
        const buyerOutputsSum = buyerSelectedOutputs.reduce((acc, obj) => {
            const amount = obj.amount || 0; return acc + amount;
        }, 0);
        const buyerRequiredAmount = totalPrice * 2;
        const buyerSelectedOutputsChangeAmount = +(buyerOutputsSum - buyerRequiredAmount - 0.0002).toFixed(8);

        // TODO: validate that the outputs are not spent
        if (buyerOutputsSum < buyerRequiredAmount) {
            this.log.warn('Not enough funds');
            throw new MessageException('Not enough funds');
        }

        const buyerSelectedOutputData: OutputData = {
            outputs: buyerSelectedOutputs,
            outputsSum: buyerOutputsSum,
            outputsChangeAmount: buyerSelectedOutputsChangeAmount
        };

        this.log.debug('sellerSelectedOutputData: ', JSON.stringify(sellerSelectedOutputData, null, 2));
        this.log.debug('buyerSelectedOutputData: ', JSON.stringify(buyerSelectedOutputData, null, 2));

        // create seller escrow addresses
        // changed to getNewAddress, since getaccountaddress doesn't return address which we can get the pubkey from
        const sellerEscrowPubAddress = await this.coreRpcService.getNewAddress(['_escrow_pub_' + listingItem.hash], false);
        const sellerEscrowChangeAddress = await this.coreRpcService.getNewAddress(['_escrow_change'], false);

        const buyerEscrowChangeAddress = this.getValueFromBidDatas(BidDataValue.BUYER_CHANGE_ADDRESS, bid.BidDatas); // TODO: Error handling - nice messagee..

        this.log.debug('sellerEscrowPubAddress: ', sellerEscrowPubAddress);
        this.log.debug('sellerEscrowChangeAddress: ', sellerEscrowChangeAddress);

        // 0.16.0.3
        // const sellerEscrowPubAddressInformation = await this.coreRpcService.validateAddress(sellerEscrowPubAddress);
        // const sellerEscrowPubAddressPublicKey = sellerEscrowPubAddressInformation.pubkey;

        // 0.17++ ...
        const sellerEscrowPubAddressInformation = await this.coreRpcService.getAddressInfo(sellerEscrowPubAddress);
        const sellerEscrowPubAddressPublicKey = sellerEscrowPubAddressInformation.pubkey;

        const buyerEscrowPubAddressPublicKey = this.getValueFromBidDatas(BidDataValue.BUYER_PUBKEY, bid.BidDatas);

        // create multisig escrow address
        // escrowMultisigAddress:  0=[{
        //   "address": "rU71DNgoAj7W6e1aQqALk66HXrUpuEbERH",
        //   "redeemScript": "522102b3d88...c52ae"
        // }]
        // todo: replace '_escrow_' + listingItem.hash with something unique
        const escrowMultisigAddress = await this.coreRpcService.addMultiSigAddress(
            2,
            [sellerEscrowPubAddressPublicKey, buyerEscrowPubAddressPublicKey].sort(),
            '_escrow_' + listingItem.hash);


        // txout: {
        //   escrowAddress: amount that should be escrowed
        //   sellerEscrowChangeAddress: sellers change amount
        //   buyerEscrowChangeAddress: buyers change amount
        // }
        const txout = await this.createTxOut(
            escrowMultisigAddress.address,
            sellerEscrowChangeAddress,
            buyerEscrowChangeAddress,
            sellerSelectedOutputData,
            buyerSelectedOutputData,
            sellerEscrowPubAddressPublicKey,
            buyerEscrowPubAddressPublicKey,
            totalPrice,
            listingItem.hash);


        const txInputs: Output[] = buyerSelectedOutputData.outputs.concat(sellerSelectedOutputData.outputs);
        const rawtx = await this.coreRpcService.createRawTransaction(txInputs, txout);

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
        const signed = await this.coreRpcService.signRawTransactionWithWallet(rawtx);
        // }


        // TODO: duplicate code, use the same signRawTx function as in EscrowActionService
        if (!signed || (signed.errors && (
                signed.errors[0].error !== 'Operation not valid with the current stack size' &&
                signed.errors[0].error !== 'Unable to sign input, invalid stack size (possibly missing key)'))) {
            this.log.error('Error signing transaction' + signed ? ': ' + signed.errors[0].error : '');
            throw new MessageException('Error signing transaction' + signed ? ': ' + signed.error : '');
        }

        if (signed.complete) {
            this.log.error('Transaction should not be complete at this stage, will not send insecure message');
            throw new MessageException('Transaction should not be complete at this stage, will not send insecure message');
        }
/*


app2_1       | 2018-08-10T14:59:37.387Z - debug: [api/services/BidActionService] signed:  0=[{
app2_1       |   "hex": "a0000000000003174cea277cd292f72b4905d6c27b96b154a29486ec54c5b813355a54a9d23c920100000
000ffffffff048074110f8fca26d65d765a6b5bb4ba77854d787e0e6ed76371858b0c4b88fc0100000000ffffffff570b5443c930818c2
94b1b980d962bcfb13c8e5fd698e67d50de0da1611dc7100200000000ffffffff0301c57f940f0000000017a914b719d75539346d6fef3
159628a4a8552e625bb118701542efa490a0000001976a914e9460bc0106406c07955d97b2daaa490ff884b1b88ac013ac24d441700000
01976a9146e379824ef2051a88f024b4d427a41d22ca5d69088ac0002473044022002e7f9a9e4e33284413602f7026b29241206c8af0b6
ca2fa8af17b6686834c29022011eb65cb5045a0545d5e5fe371cf9c2cbd901e990ff97100641629d10757732e012103585674f67cc9b47
d4ced0aef20e1dd3aec22f2389c5324613e619f8e3c7ba94e024830450221008252fdee38a172979b590c501143f72ea1e7fa3c68b7f15
2793996a6d1d37c3602205588dcfa4e884624cdc74f481e52debaacb5ad66adf3f8a81a649f3e2d31ed62012102669491ef021dd64ea19
e49dbb5c8587b491567a45351f64a5e73ed1a35d02710",
app2_1       |   "complete": false,
app2_1       |   "errors": [
app2_1       |     {
app2_1       |       "txid": "923cd2a9545a3513b8c554ec8694a254b1967bc2d605492bf792d27c27ea4c17",
app2_1       |       "vout": 1,
app2_1       |       "witness": [],
app2_1       |       "scriptSig": "",
app2_1       |       "sequence": 4294967295,
app2_1       |       "error": "Input not found or already spent"
app2_1       |     }
app2_1       |   ]
app2_1       | }]



 */
        // - Most likely the transaction building and signing will happen in a different command that takes place before this..
        // End - Ryno Hacks

        const bidDatas: IdValuePair[] = this.getIdValuePairsFromArray([
            BidDataValue.SELLER_OUTPUTS, sellerSelectedOutputData.outputs,
            BidDataValue.BUYER_OUTPUTS, buyerSelectedOutputData.outputs, // allready in BidData, not necessarily needed here
            // 'pubkeys', [sellerEscrowPubAddressPublicKey, buyerEcrowPubAddressPublicKey].sort(),
            BidDataValue.SELLER_PUBKEY, sellerEscrowPubAddressPublicKey,
            BidDataValue.BUYER_PUBKEY, buyerEscrowPubAddressPublicKey, // allready in BidData, not necessarily needed here
            BidDataValue.RAW_TX, signed.hex
        ]);
        // this.log.debug('bidDatas: ', JSON.stringify(bidDatas, null, 2));

        return bidDatas;
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
    public createTxOut(escrowMultisigAddress: string,
                       sellerEscrowChangeAddress: string,
                       buyerEscrowChangeAddress: string,
                       sellerSelectedOutputData: OutputData,
                       buyerSelectedOutputData: OutputData,
                       sellerEscrowPubAddressPublicKey: string,
                       buyerEscrowPubAddressPublicKey: string,
                       itemTotalPrice: number,
                       listingItemHash: string): any {

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
                if (buyerOutputsSum > itemTotalPrice * 2) { // TODO: Ratio
                    buyerOutputsChangeAmount = +(buyerOutputsSum - (itemTotalPrice * 2) - 0.0001).toFixed(8); // TODO: Get actual fee...
                    return;
                }
            });

            // todo: calculate buyers requiredAmount from Ratio
            // check that buyers outputs contain enough funds
            if (buyerOutputsSum < itemTotalPrice * 2) {
                this.log.warn('Buyers outputs do not contain enough funds!');
                throw new MessageException('Buyers outputs do not contain enough funds!');
            }
            txout[buyerEscrowChangeAddress] = buyerSelectedOutputData.outputsChangeAmount;

        } else {
            this.log.error('Buyer didn\'t supply outputs!');
            throw new MessageException('Buyer didn\'t supply outputs!'); // TODO: proper message for no outputs :P
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
     * @param {module:resources.ListingItem} listingItem
     * @param {module:resources.Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    public async cancel(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse> {

        if (bid.action === BidMessageType.MPA_BID) {

            // create the bid cancel message
            const bidMessage: BidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_CANCEL, listingItem.hash);

            // Update the bid in the database with new action.
            const tmpBidCreateRequest: BidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bid.bidder, bid);
            const bidUpdateRequest: BidUpdateRequest = {
                listing_item_id: tmpBidCreateRequest.listing_item_id,
                action: BidMessageType.MPA_CANCEL,
                bidder: tmpBidCreateRequest.bidder,
                bidDatas: tmpBidCreateRequest.bidDatas
            } as BidUpdateRequest;
            await this.bidService.update(bid.id, bidUpdateRequest);

            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            } as MarketplaceMessage;

            this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

            // remove buyers lockedoutputs
            let selectedOutputs = this.getValueFromBidDatas(BidDataValue.BUYER_OUTPUTS, bid.BidDatas);
            selectedOutputs = selectedOutputs[0] === '[' ? JSON.parse(selectedOutputs) : selectedOutputs;
            await this.lockedOutputService.destroyLockedOutputs(selectedOutputs);
            const success = await this.lockedOutputService.unlockOutputs(selectedOutputs);

            if (success) {
                // broadcast the cancel bid message
                return await this.smsgService.smsgSend(bid.bidder, listingItem.seller, marketPlaceMessage, false);
            } else {
                throw new MessageException('Failed to unlock the locked outputs.');
            }

        } else {
            this.log.error(`Bid can not be cancelled because it was already been ${bid.action}`);
            throw new MessageException(`Bid can not be cancelled because it was already been ${bid.action}`);
        }
    }

    /**
     * Reject a Bid
     * todo: add the bid as param, so we know whose bid we are rejecting. now supports just one bidder.
     *
     * @param {module:resources.ListingItem} listingItem
     * @param {module:resources.Bid} bid
     * @returns {Promise<SmsgSendResponse>}
     */
    public async reject(listingItem: resources.ListingItem, bid: resources.Bid): Promise<SmsgSendResponse> {

        if (bid.action === BidMessageType.MPA_BID) {
            // fetch the seller profile
            const sellerProfileModel: Profile = await this.profileService.findOneByAddress(listingItem.seller);
            if (!sellerProfileModel) {
                this.log.error('Seller profile not found. We aren\'t the seller?');
                throw new MessageException('Seller profile not found. We aren\'t the seller?');
            }
            const sellerProfile = sellerProfileModel.toJSON();

            // create the bid reject message
            const bidMessage = await this.bidFactory.getMessage(BidMessageType.MPA_REJECT, listingItem.hash);

            // Update the bid in the database with new action.
            const tmpBidCreateRequest: BidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bid.bidder, bid);
            const bidUpdateRequest: BidUpdateRequest = {
                listing_item_id: tmpBidCreateRequest.listing_item_id,
                action: BidMessageType.MPA_REJECT,
                bidder: tmpBidCreateRequest.bidder,
                bidDatas: tmpBidCreateRequest.bidDatas
            } as BidUpdateRequest;
            await this.bidService.update(bid.id, bidUpdateRequest);

            const marketPlaceMessage = {
                version: process.env.MARKETPLACE_VERSION,
                mpaction: bidMessage
            } as MarketplaceMessage;

            this.log.debug('send(), marketPlaceMessage: ', marketPlaceMessage);

            // broadcast the reject bid message
            return await this.smsgService.smsgSend(sellerProfile.address, bid.bidder, marketPlaceMessage, false);
        } else {
            this.log.error(`Bid can not be rejected because it was already been ${bid.action}`);
            throw new MessageException(`Bid can not be rejected because it was already been ${bid.action}`);
        }
    }

    /**
     * process received BidMessage
     * - save ActionMessage
     * - create Bid
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.Bid>}
     */
    public async processBidReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const bidMessage: BidMessage = event.marketplaceMessage.mpaction as BidMessage;
        const bidder = event.smsgMessage.from;
        const message = event.marketplaceMessage;

        if (!message.mpaction || !message.mpaction.item) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        return await this.listingItemService.findOneByHash(message.mpaction.item)
            .then(async listingItemModel => {

                const listingItem = listingItemModel.toJSON();

                // todo: check that the listingitem is yours

                // first save actionmessage
                const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();

                // TODO: should someone be able to bid more than once?
                // TODO: for that to be possible, we need to be able to identify different bids from one address
                // -> needs bid.hash
                // TODO: when testing locally, bid gets created first for the bidder after which it can be found here when receiving the bid

                const biddersExistingBidsForItem = await this.bidService.search({
                    listingItemHash: bidMessage.item,
                    bidders: [bidder]
                } as BidSearchParams);

                if (biddersExistingBidsForItem && biddersExistingBidsForItem.length > 0) {
                    this.log.debug('biddersExistingBidsForItem:', JSON.stringify(biddersExistingBidsForItem, null, 2));
                    throw new MessageException('Bids allready exist for the ListingItem for the bidder.');
                }

                if (bidMessage) {
                    const createdBid = await this.createBid(bidMessage, listingItem, bidder);
                    // this.log.debug('createdBid:', JSON.stringify(createdBid, null, 2));

                    // TODO: do whatever else needs to be done

                    return SmsgMessageStatus.PROCESSED;
                } else {
                    throw new MessageException('Missing BidMessage');
                }
            })
            .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus.WAITING;
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
    public async processAcceptBidReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const bidMessage: BidMessage = event.marketplaceMessage.mpaction as BidMessage;
        const bidder = event.smsgMessage.to; // from seller to buyer

        // find the ListingItem
        const message = event.marketplaceMessage;
        if (!message.mpaction || !message.mpaction.item) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        return await this.listingItemService.findOneByHash(message.mpaction.item)
            .then(async listingItemModel => {

                const listingItem = listingItemModel.toJSON();

                // TODO: save incoming and outgoing actionmessages
                // TODO: ... and do it in one place
                // first save it
                const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();

                if (bidMessage) {

                    // find the Bid
                    const existingBid = _.find(listingItem.Bids, (o: resources.Bid) => {
                        return o.action === BidMessageType.MPA_BID && o.bidder === bidder;
                    });

                    // this.log.debug('existingBid:', JSON.stringify(existingBid, null, 2));

                    if (existingBid) {

                        // update the bid locally
                        const bidUpdateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bidder, existingBid);
                        // this.log.debug('bidUpdateRequest:', JSON.stringify(bidUpdateRequest, null, 2));
                        const updatedBidModel = await this.bidService.update(existingBid.id, bidUpdateRequest);
                        let updatedBid: resources.Bid = updatedBidModel.toJSON();
                        // this.log.debug('updatedBid:', JSON.stringify(updatedBid, null, 2));

                        // create the order from the bid
                        const orderCreateRequest = await this.orderFactory.getModelFromBid(updatedBid);
                        const orderModel = await this.orderService.create(orderCreateRequest);
                        const order = orderModel.toJSON();

                        this.log.debug('processAcceptBidReceivedEvent(), created Order: ', JSON.stringify(order, null, 2));

                        const orderHash = this.getValueFromBidDatas(BidDataValue.ORDER_HASH, updatedBid.BidDatas);
                        this.log.debug('seller orderHash: ', orderHash);
                        this.log.debug('local orderHash: ', order.hash);

                        if (orderHash !== order.hash) {
                            throw new MessageException('Created Order.hash does not match with the received orderHash.');
                        }
                        await updatedBidModel.fetch({withRelated: ['OrderItem']});
                        updatedBid = updatedBidModel.toJSON();
                        // TODO: do whatever else needs to be done

                        // this.log.debug('processAcceptBidReceivedEvent(), updatedBid: ', JSON.stringify(updatedBid, null, 2));
                        return SmsgMessageStatus.PROCESSED;
                    } else {
                        return SmsgMessageStatus.WAITING;
                    }
                } else {
                    throw new MessageException('Missing BidMessage.');
                }
            })
            .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus.WAITING;
            });
    }

    /**
     * process received CancelBidMessage
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.ActionMessage>}
     */
    public async processCancelBidReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const bidMessage: any = event.marketplaceMessage.mpaction as BidMessage;
        const bidder = event.smsgMessage.from;
        // find the ListingItem
        const message = event.marketplaceMessage;
        if (!message.mpaction || !message.mpaction.item) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        return await this.listingItemService.findOneByHash(message.mpaction.item)
            .then(async listingItemModel => {

                const listingItem = listingItemModel.toJSON();

                // first save it
                const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();

                // Get latest bid from listingItemId and bidder so we can get bidId.
                const params: BidSearchParams = new BidSearchParams({
                    listingItemId: listingItem.id,
                    action: BidMessageType.MPA_BID,
                    bidders: [ bidder ],
                    ordering: SearchOrder.DESC
                });
                const oldBids: Bookshelf.Collection<Bid> = await this.bidService.search(params);
                let oldBid: any = oldBids.pop();
                if (!oldBid) {
                    // throw new MessageException('Missing old bid.');
                    this.log.error('Missing old bid.');
                    return SmsgMessageStatus.WAITING;
                }
                oldBid = oldBid.toJSON();

                // Update the bid in the database with new action.
                const tmpBidCreateRequest: BidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bidder, oldBid);
                const bidUpdateRequest: BidUpdateRequest = {
                    listing_item_id: tmpBidCreateRequest.listing_item_id,
                    action: BidMessageType.MPA_CANCEL,
                    bidder: tmpBidCreateRequest.bidder,
                    bidDatas: tmpBidCreateRequest.bidDatas
                } as BidUpdateRequest;
                const updatedBid = await this.bidService.update(oldBid.id, bidUpdateRequest);

                return SmsgMessageStatus.PROCESSED;
            })
            .catch(reason => {
                // ListingItem not found
                return SmsgMessageStatus.WAITING;
            });

    }

    /**
     * process received RejectBidMessage
     *
     * @param {MarketplaceEvent} event
     * @returns {Promise<module:resources.ActionMessage>}
     */
    public async processRejectBidReceivedEvent(event: MarketplaceEvent): Promise<SmsgMessageStatus> {

        const message = event.marketplaceMessage;
        const bidMessage: any = message.mpaction as BidMessage;
        const bidder = event.smsgMessage.to;

        // find the ListingItem
        if (!bidMessage) {   // ACTIONEVENT
            throw new MessageException('Missing mpaction.');
        }

        return await this.listingItemService.findOneByHash(bidMessage.item)
            .then(async listingItemModel => {
                const listingItem = listingItemModel.toJSON();

                // first save it
                const actionMessageModel = await this.actionMessageService.createFromMarketplaceEvent(event, listingItem);
                const actionMessage = actionMessageModel.toJSON();

                // Get latest bid from listingItemId and bidder so we can get bidId.
                const params: BidSearchParams = new BidSearchParams({
                    listingItemId: listingItem.id,
                    action: BidMessageType.MPA_BID,
                    bidders: [ bidder ],
                    ordering: SearchOrder.DESC
                });
                const oldBids: Bookshelf.Collection<Bid> = await this.bidService.search(params);
                let oldBid: any = oldBids.pop();
                if (!oldBid) {
                    throw new MessageException('Missing old bid.');
                }
                oldBid = oldBid.toJSON();

                // Update the bid in the database with new action.
                const tmpBidCreateRequest: BidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bidder, oldBid);
                const bidUpdateRequest: BidUpdateRequest = {
                    listing_item_id: tmpBidCreateRequest.listing_item_id,
                    action: BidMessageType.MPA_REJECT,
                    bidder: tmpBidCreateRequest.bidder,
                    bidDatas: tmpBidCreateRequest.bidDatas
                } as BidUpdateRequest;
                const bidModel = await this.bidService.update(oldBid.id, bidUpdateRequest);
                const bid = bidModel.toJSON();

                // remove buyers lockedoutputs
                let selectedOutputs = this.getValueFromBidDatas(BidDataValue.BUYER_OUTPUTS, bid.BidDatas);
                selectedOutputs = selectedOutputs[0] === '[' ? JSON.parse(selectedOutputs) : selectedOutputs;

                await this.lockedOutputService.destroyLockedOutputs(selectedOutputs);
                const success = await this.lockedOutputService.unlockOutputs(selectedOutputs);

                if (success) {
                    return SmsgMessageStatus.PROCESSED;
                } else {
                    throw new MessageException('Failed to unlock the locked outputs.');
                }

            })
            .catch(reason => {
                return SmsgMessageStatus.WAITING;
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
    public getIdValuePairsFromArray(data: any[]): IdValuePair[] {
        const idValuePairs: IdValuePair[] = [];

        // convert the bid data params as idValuePairs array
        for (let i = 0; i < data.length; i += 2) {
            idValuePairs.push({id: data[i], value: data[i + 1]});
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
    private getValueFromBidDatas(key: string, bidDatas: resources.BidData[]): any {
        const value = bidDatas.find(kv => kv.dataId === key);
        if (value) {
            return value.dataValue;
        } else {
            this.log.error('Missing BidData value for key: ' + key);
            throw new MessageException('Missing BidData value for key: ' + key);
        }
    }

    private async createBid(bidMessage: BidMessage, listingItem: resources.ListingItem, bidder: string): Promise<resources.Bid> {

        // create a bid
        const bidCreateRequest = await this.bidFactory.getModel(bidMessage, listingItem.id, bidder);

        // make sure the bids address type is correct
        this.log.debug('found listingItem.id: ', listingItem.id);

        if (!_.isEmpty(listingItem.ListingItemTemplate)) { // local profile is selling
            this.log.debug('listingItem has template: ', listingItem.ListingItemTemplate.id);
            this.log.debug('listingItem template has profile: ', listingItem.ListingItemTemplate.Profile.id);
            bidCreateRequest.address.type = AddressType.SHIPPING_BID;
            bidCreateRequest.address.profile_id = listingItem.ListingItemTemplate.Profile.id;
        } else { // local profile is buying
            this.log.debug('listingItem has no template ');
            this.log.debug('bidder: ', bidder);
            const profileModel = await this.profileService.findOneByAddress(bidder);
            const profile = profileModel.toJSON();
            bidCreateRequest.address.type = AddressType.SHIPPING_BID;
            bidCreateRequest.address.profile_id = profile.id;
        }

        const createdBidModel = await this.bidService.create(bidCreateRequest);
        const createdBid = createdBidModel.toJSON();
        return createdBid;
    }

    /**
     * get seller from listingitems MP_ITEM_ADD ActionMessage
     * todo:  refactor
     * @param {"resources".ListingItem} listingItem
     * @returns {Promise<string>}
     */
    private getBuyer(listingItem: resources.ListingItem): string {
        for (const actionMessage of listingItem.ActionMessages) {
            if (actionMessage.action === 'MPA_BID') {
                return actionMessage.MessageData.from;
            }
        }
        throw new MessageException('Buyer not found for ListingItem.');
    }

    private configureEventListeners(): void {
        this.eventEmitter.on(Events.BidReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processBidReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('ERROR: BidReceivedMessage processing failed.', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });
        });
        this.eventEmitter.on(Events.AcceptBidReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processAcceptBidReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('ERROR: BidAcceptMessage processing failed.', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });
        });
        this.eventEmitter.on(Events.CancelBidReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processCancelBidReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('ERROR: BidCancelMessage processing failed.', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });
        });
        this.eventEmitter.on(Events.RejectBidReceivedEvent, async (event) => {
            this.log.debug('Received event:', JSON.stringify(event, null, 2));
            await this.processRejectBidReceivedEvent(event)
                .then(async status => {
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, status);
                })
                .catch(async reason => {
                    this.log.error('ERROR: BidRejectMessage processing failed.', reason);
                    await this.smsgMessageService.updateSmsgMessageStatus(event.smsgMessage, SmsgMessageStatus.PROCESSING_FAILED);
                });

        });
    }


}
