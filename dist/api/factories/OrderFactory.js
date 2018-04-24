"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const BidMessageType_1 = require("../enums/BidMessageType");
const MessageException_1 = require("../exceptions/MessageException");
const AddressType_1 = require("../enums/AddressType");
const OrderStatus_1 = require("../enums/OrderStatus");
const ObjectHash_1 = require("../../core/helpers/ObjectHash");
const HashableObjectType_1 = require("../enums/HashableObjectType");
let OrderFactory = class OrderFactory {
    constructor(Logger) {
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * create a OrderCreateRequest
     *
     * @param {"resources".Bid} bid
     * @returns {Promise<OrderCreateRequest>}
     */
    getModelFromBid(bid) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // only bids with action MPA_ACCEPT can be converted to Order
            if (bid.action === BidMessageType_1.BidMessageType.MPA_ACCEPT) {
                const address = this.getShippingAddress(bid);
                const orderItems = this.getOrderItems(bid);
                const buyer = bid.bidder;
                const seller = bid.ListingItem.seller;
                const orderCreateRequest = {
                    address,
                    orderItems,
                    buyer,
                    seller
                };
                // can we move this hashing to service level
                orderCreateRequest.hash = ObjectHash_1.ObjectHash.getHash(orderCreateRequest, HashableObjectType_1.HashableObjectType.ORDER_CREATEREQUEST);
                return orderCreateRequest;
            }
            else {
                throw new MessageException_1.MessageException('Cannot create Order from this BidMessageType.');
            }
        });
    }
    getShippingAddress(bid) {
        return {
            profile_id: bid.ShippingAddress.Profile.id,
            firstName: bid.ShippingAddress.firstName,
            lastName: bid.ShippingAddress.lastName,
            addressLine1: bid.ShippingAddress.addressLine1,
            addressLine2: bid.ShippingAddress.addressLine2,
            city: bid.ShippingAddress.city,
            state: bid.ShippingAddress.state,
            zipCode: bid.ShippingAddress.zipCode,
            country: bid.ShippingAddress.country,
            type: AddressType_1.AddressType.SHIPPING_ORDER
        };
    }
    getOrderItems(bid) {
        const orderItemCreateRequests = [];
        const orderItemObjects = this.getOrderItemObjects(bid.BidDatas);
        const orderItemCreateRequest = {
            bid_id: bid.id,
            itemHash: bid.ListingItem.hash,
            status: OrderStatus_1.OrderStatus.AWAITING_ESCROW,
            orderItemObjects
        };
        // in alpha 1 order contains 1 orderItem
        orderItemCreateRequests.push(orderItemCreateRequest);
        return orderItemCreateRequests;
    }
    getOrderItemObjects(bidDatas) {
        const orderItemObjectCreateRequests = [];
        for (const bidData of bidDatas) {
            const orderItemObjectCreateRequest = {
                dataId: bidData.dataId,
                dataValue: bidData.dataValue
            };
            orderItemObjectCreateRequests.push(orderItemObjectCreateRequest);
        }
        return orderItemObjectCreateRequests;
    }
};
OrderFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], OrderFactory);
exports.OrderFactory = OrderFactory;
//# sourceMappingURL=OrderFactory.js.map