"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const OrderRepository_1 = require("../repositories/OrderRepository");
const OrderCreateRequest_1 = require("../requests/OrderCreateRequest");
const OrderUpdateRequest_1 = require("../requests/OrderUpdateRequest");
const OrderSearchParams_1 = require("../requests/OrderSearchParams");
const HashableObjectType_1 = require("../enums/HashableObjectType");
const ObjectHash_1 = require("../../core/helpers/ObjectHash");
const MessageException_1 = require("../exceptions/MessageException");
const OrderItemService_1 = require("./OrderItemService");
const AddressService_1 = require("./AddressService");
const ListingItemService_1 = require("./ListingItemService");
const AddressType_1 = require("../enums/AddressType");
let OrderService = class OrderService {
    constructor(addressService, listingItemService, orderItemService, orderRepo, Logger) {
        this.addressService = addressService;
        this.listingItemService = listingItemService;
        this.orderItemService = orderItemService;
        this.orderRepo = orderRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.orderRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const order = yield this.orderRepo.findOne(id, withRelated);
            if (order === null) {
                this.log.warn(`Order with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return order;
        });
    }
    /**
     * search Order using given OrderSearchParams
     *
     * @param options
     * @returns {Promise<Bookshelf.Collection<Bid>>}
     */
    search(options, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // if item hash was given, set the item id
            if (options.listingItemHash) {
                const foundListing = yield this.listingItemService.findOneByHash(options.listingItemHash, false);
                options.listingItemId = foundListing.Id;
            }
            return yield this.orderRepo.search(options, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // you need at least one order item to create an order
            body.hash = ObjectHash_1.ObjectHash.getHash(body, HashableObjectType_1.HashableObjectType.ORDER_CREATEREQUEST);
            const orderItemCreateRequests = body.orderItems;
            delete body.orderItems;
            const addressCreateRequest = body.address;
            delete body.address;
            // make sure we have at least one orderItem
            if (_.isEmpty(orderItemCreateRequests)) {
                this.log.error('Order does not contain orderItems.');
                throw new MessageException_1.MessageException('Order does not contain orderItems.');
            }
            // shipping address
            if (_.isEmpty(addressCreateRequest)) {
                this.log.error('Request body is not valid, address missing');
                throw new MessageException_1.MessageException('Order does not contain ShippingAddress');
            }
            // make sure the Orders shipping address has the correct type
            addressCreateRequest.type = AddressType_1.AddressType.SHIPPING_ORDER;
            this.log.debug('OrderCreateRequest body:', JSON.stringify(body, null, 2));
            this.log.debug('addressCreateRequest for ORDER: ', JSON.stringify(addressCreateRequest, null, 2));
            // save shipping address
            const addressModel = yield this.addressService.create(addressCreateRequest);
            const address = addressModel.toJSON();
            this.log.debug('created address: ', JSON.stringify(address, null, 2));
            // set the address_id for order
            body.address_id = address.id;
            // this.log.debug('create Order, body: ', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the order
            const orderModel = yield this.orderRepo.create(body);
            const order = orderModel.toJSON();
            this.log.debug('created order: ', JSON.stringify(order, null, 2));
            // then create the OrderItems
            for (const orderItemCreateRequest of orderItemCreateRequests) {
                orderItemCreateRequest.order_id = order.id;
                yield this.orderItemService.create(orderItemCreateRequest);
            }
            // finally find and return the created order
            const newOrder = yield this.findOne(order.id);
            return newOrder;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const order = yield this.findOne(id, false);
            // set new values
            order.Hash = body.hash;
            order.Buyer = body.buyer;
            order.Seller = body.seller;
            // update order record
            const updatedOrder = yield this.orderRepo.update(id, order.toJSON());
            // const newOrder = await this.findOne(id);
            // return newOrder;
            return updatedOrder;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const orderModel = yield this.findOne(id);
            const order = orderModel.toJSON();
            // first remove the related address
            yield this.addressService.destroy(order.ShippingAddress.id);
            // then remove the OrderItems
            for (const orderItem of order.OrderItems) {
                yield this.orderItemService.destroy(orderItem.id);
            }
            this.log.debug('removing order:', id);
            yield this.orderRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(OrderSearchParams_1.OrderSearchParams)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [OrderSearchParams_1.OrderSearchParams, Boolean]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderService.prototype, "search", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(OrderCreateRequest_1.OrderCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [OrderCreateRequest_1.OrderCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(OrderUpdateRequest_1.OrderUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, OrderUpdateRequest_1.OrderUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderService.prototype, "update", null);
OrderService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.AddressService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.OrderItemService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Repository.OrderRepository)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(4, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [AddressService_1.AddressService,
        ListingItemService_1.ListingItemService,
        OrderItemService_1.OrderItemService,
        OrderRepository_1.OrderRepository, Object])
], OrderService);
exports.OrderService = OrderService;
//# sourceMappingURL=OrderService.js.map