"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const BidMessageType_1 = require("../enums/BidMessageType");
const MessageException_1 = require("../exceptions/MessageException");
let BidFactory = class BidFactory {
    constructor(Logger) {
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     *
     * @param {BidMessageType} bidMessageType
     * @param {string} itemHash
     * @param {any[]} idValuePairObjects { id: 'objectid', value: 'objectvalue' }
     * @returns {Promise<BidMessage>}
     */
    getMessage(bidMessageType, itemHash, idValuePairObjects) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const message = {
                action: bidMessageType,
                item: itemHash,
                objects: idValuePairObjects
            };
            return message;
        });
    }
    /**
     * create a BidCreateRequest
     *
     * @param {BidMessage} bidMessage
     * @param {number} listingItemId
     * @param {string} bidder
     * @param {"resources".Bid} latestBid
     * @returns {Promise<BidCreateRequest>}
     */
    getModel(bidMessage, listingItemId, bidder, latestBid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!listingItemId) {
                throw new MessageException_1.MessageException('Invalid listingItemId.');
            }
            // todo: implement part address validator and validate
            if (!bidder && typeof bidder !== 'string') {
                throw new MessageException_1.MessageException('Invalid bidder.');
            }
            // check that the bidAction is valid, throw if not
            if (this.checkBidMessageActionValidity(bidMessage, latestBid)) {
                const bidDataValues = {};
                // copy the existing key-value pairs from latestBid.BidDatas
                if (latestBid && latestBid.BidDatas) {
                    for (const bidData of latestBid.BidDatas) {
                        bidDataValues[bidData.dataId] = bidData.dataValue;
                    }
                }
                // copy the new key-value pairs from bidMessage overriding the old if some exist
                if (bidMessage.objects) {
                    for (const bidData of bidMessage.objects) {
                        bidDataValues[bidData.id] = bidData.value;
                    }
                }
                // create bidDataCreateRequests
                const bidDatas = Object.keys(bidDataValues).map((key) => {
                    return {
                        dataId: key,
                        dataValue: bidDataValues[key]
                    };
                });
                // this.log.debug('bidDatas:', JSON.stringify(bidDatas, null, 2));
                let address;
                if (bidMessage.action === BidMessageType_1.BidMessageType.MPA_BID) {
                    const firstName = this.getValueFromBidDatas('ship.firstName', bidDatas);
                    const lastName = this.getValueFromBidDatas('ship.lastName', bidDatas);
                    const addressLine1 = this.getValueFromBidDatas('ship.addressLine1', bidDatas);
                    const addressLine2 = this.getValueFromBidDatas('ship.addressLine2', bidDatas);
                    const city = this.getValueFromBidDatas('ship.city', bidDatas);
                    const state = this.getValueFromBidDatas('ship.state', bidDatas);
                    const zipCode = this.getValueFromBidDatas('ship.zipCode', bidDatas);
                    const country = this.getValueFromBidDatas('ship.country', bidDatas);
                    address = {
                        firstName, lastName, addressLine1, addressLine2, city, state, zipCode, country
                    };
                }
                // create and return the request that can be used to create the bid
                const bidCreateRequest = {
                    address,
                    listing_item_id: listingItemId,
                    action: bidMessage.action,
                    bidder,
                    bidDatas
                };
                return bidCreateRequest;
            }
            else {
                throw new MessageException_1.MessageException('Invalid BidMessageType.');
            }
        });
    }
    /**
     * Checks if the action in the given BidMessage is valid for the latest bid
     *
     * @param bidMessage
     * @param latestBid
     * @returns {boolean}
     */
    checkBidMessageActionValidity(bidMessage, latestBid) {
        if (latestBid) {
            switch (latestBid.action) {
                case BidMessageType_1.BidMessageType.MPA_BID.toString():
                    // if the latest bid was allready bidded on, then the message needs to be something else
                    return bidMessage.action !== BidMessageType_1.BidMessageType.MPA_BID.toString();
                case BidMessageType_1.BidMessageType.MPA_ACCEPT.toString():
                    // latest bid was allready accepted, any bid is invalid
                    return false;
                case BidMessageType_1.BidMessageType.MPA_CANCEL.toString():
                    // latest bid was cancelled, so we allow only new bids
                    return bidMessage.action === BidMessageType_1.BidMessageType.MPA_BID.toString();
                case BidMessageType_1.BidMessageType.MPA_REJECT.toString():
                    // latest bid was rejected, so we allow only new bids
                    return bidMessage.action === BidMessageType_1.BidMessageType.MPA_BID.toString();
            }
        }
        else if (bidMessage.action === BidMessageType_1.BidMessageType.MPA_BID.toString()) {
            // if no existing bid and message is MPA_BID -> true
            return true;
        }
        return false;
    }
    /**
     * todo: refactor duplicate code
     * @param {string} key
     * @param {"resources".BidData[]} bidDatas
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
};
BidFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], BidFactory);
exports.BidFactory = BidFactory;
//# sourceMappingURL=BidFactory.js.map