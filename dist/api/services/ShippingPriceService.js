"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ShippingPriceRepository_1 = require("../repositories/ShippingPriceRepository");
const ShippingPriceCreateRequest_1 = require("../requests/ShippingPriceCreateRequest");
const ShippingPriceUpdateRequest_1 = require("../requests/ShippingPriceUpdateRequest");
let ShippingPriceService = class ShippingPriceService {
    constructor(shippingPriceRepo, Logger) {
        this.shippingPriceRepo = shippingPriceRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.shippingPriceRepo.findAll();
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shippingPrice = yield this.shippingPriceRepo.findOne(id, withRelated);
            if (shippingPrice === null) {
                this.log.warn(`ShippingPrice with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return shippingPrice;
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // If the request body was valid we will create the shippingPrice
            const shippingPrice = yield this.shippingPriceRepo.create(body);
            // finally find and return the created shippingPrice
            const newShippingPrice = yield this.findOne(shippingPrice.Id);
            return newShippingPrice;
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = JSON.parse(JSON.stringify(data));
            // find the existing one without related
            const shippingPrice = yield this.findOne(id, false);
            // set new values
            shippingPrice.Domestic = body.domestic;
            shippingPrice.International = body.international;
            // update shippingPrice record
            const updatedShippingPrice = yield this.shippingPriceRepo.update(id, shippingPrice.toJSON());
            return updatedShippingPrice;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.shippingPriceRepo.destroy(id);
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ShippingPriceCreateRequest_1.ShippingPriceCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ShippingPriceCreateRequest_1.ShippingPriceCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShippingPriceService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ShippingPriceUpdateRequest_1.ShippingPriceUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ShippingPriceUpdateRequest_1.ShippingPriceUpdateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ShippingPriceService.prototype, "update", null);
ShippingPriceService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ShippingPriceRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ShippingPriceRepository_1.ShippingPriceRepository, Object])
], ShippingPriceService);
exports.ShippingPriceService = ShippingPriceService;
//# sourceMappingURL=ShippingPriceService.js.map