"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const OrderItemObjectRepository_1 = require("../repositories/OrderItemObjectRepository");
const OrderItemObjectCreateRequest_1 = require("../requests/OrderItemObjectCreateRequest");
const OrderItemObjectUpdateRequest_1 = require("../requests/OrderItemObjectUpdateRequest");
let OrderItemObjectService = class OrderItemObjectService {
    constructor(orderItemObjectRepo, Logger) {
        this.orderItemObjectRepo = orderItemObjectRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.orderItemObjectRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const orderItemObject = yield this.orderItemObjectRepo.findOne(id, withRelated);
            if (orderItemObject === null) {
                this.log.warn(`OrderItemObject with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return orderItemObject;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // this.log.debug('create OrderItemObject, body: ', JSON.stringify(body, null, 2));
            // If the request body was valid we will create the orderItemObject
            const orderItemObjectModel = yield this.orderItemObjectRepo.create(body);
            const orderItemObject = orderItemObjectModel.toJSON();
            // finally find and return the created orderItemObject
            const newOrderItemObject = yield this.findOne(orderItemObject.id);
            return newOrderItemObject;
        });
    }
    update(id, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const orderItemObject = yield this.findOne(id, false);
            // set new values
            orderItemObject.DataId = body.dataId;
            orderItemObject.DataValue = body.dataValue;
            // update orderItemObject record
            const updatedOrderItemObject = yield this.orderItemObjectRepo.update(id, orderItemObject.toJSON());
            return updatedOrderItemObject;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('removing orderItemObject:', id);
            yield this.orderItemObjectRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(OrderItemObjectCreateRequest_1.OrderItemObjectCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [OrderItemObjectCreateRequest_1.OrderItemObjectCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderItemObjectService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(OrderItemObjectUpdateRequest_1.OrderItemObjectUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, OrderItemObjectUpdateRequest_1.OrderItemObjectUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], OrderItemObjectService.prototype, "update", null);
OrderItemObjectService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.OrderItemObjectRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [OrderItemObjectRepository_1.OrderItemObjectRepository, Object])
], OrderItemObjectService);
exports.OrderItemObjectService = OrderItemObjectService;
//# sourceMappingURL=OrderItemObjectService.js.map