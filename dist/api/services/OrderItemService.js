"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const OrderItemRepository_1 = require("../repositories/OrderItemRepository");
const OrderItemCreateRequest_1 = require("../requests/OrderItemCreateRequest");
const OrderItemUpdateRequest_1 = require("../requests/OrderItemUpdateRequest");
const OrderItemObjectService_1 = require("./OrderItemObjectService");
let OrderItemService = class OrderItemService {
    constructor(orderItemObjectService, orderItemRepo, Logger) {
        this.orderItemObjectService = orderItemObjectService;
        this.orderItemRepo = orderItemRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.orderItemRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const orderItem = yield this.orderItemRepo.findOne(id, withRelated);
            if (orderItem === null) {
                this.log.warn(`OrderItem with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return orderItem;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            const orderItemObjects = body.orderItemObjects;
            delete body.orderItemObjects;
            // this.log.debug('create OrderItem, body: ', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the orderItem
            const orderItemModel = yield this.orderItemRepo.create(body);
            const orderItem = orderItemModel.toJSON();
            // this.log.debug('created orderItem: ', JSON.stringify(orderItem, null, 2));
            for (const orderItemObject of orderItemObjects) {
                orderItemObject.order_item_id = orderItem.id;
                // stringify unless string
                orderItemObject.dataValue = typeof (orderItemObject.dataValue) === 'string' ? orderItemObject.dataValue : JSON.stringify(orderItemObject.dataValue);
                yield this.orderItemObjectService.create(orderItemObject);
            }
            // finally find and return the created orderItem
            const newOrderItem = yield this.findOne(orderItem.id);
            return newOrderItem;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const orderItem = yield this.findOne(id, false);
            // set new values
            orderItem.Status = body.status;
            // update orderItem record
            const updatedOrderItem = yield this.orderItemRepo.update(id, orderItem.toJSON());
            // const newOrderItem = await this.findOne(id);
            // return newOrderItem;
            return updatedOrderItem;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const orderItemModel = yield this.findOne(id);
            const orderItem = orderItemModel.toJSON();
            // then remove the OrderItemObjects
            for (const orderItemObject of orderItem.OrderItemObjects) {
                yield this.orderItemObjectService.destroy(orderItemObject.id);
            }
            this.log.debug('removing orderItem:', id);
            yield this.orderItemRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(OrderItemCreateRequest_1.OrderItemCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [OrderItemCreateRequest_1.OrderItemCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderItemService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(OrderItemUpdateRequest_1.OrderItemUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, OrderItemUpdateRequest_1.OrderItemUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderItemService.prototype, "update", null);
OrderItemService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.OrderItemObjectService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Repository.OrderItemRepository)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(2, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [OrderItemObjectService_1.OrderItemObjectService,
        OrderItemRepository_1.OrderItemRepository, Object])
], OrderItemService);
exports.OrderItemService = OrderItemService;
//# sourceMappingURL=OrderItemService.js.map