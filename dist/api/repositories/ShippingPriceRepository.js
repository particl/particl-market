"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ShippingPriceRepository = class ShippingPriceRepository {
    constructor(ShippingPriceModel, Logger) {
        this.ShippingPriceModel = ShippingPriceModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ShippingPriceModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ShippingPriceModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shippingPrice = this.ShippingPriceModel.forge(data);
            try {
                const shippingPriceCreated = yield shippingPrice.save();
                return this.ShippingPriceModel.fetchById(shippingPriceCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the shippingPrice!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shippingPrice = this.ShippingPriceModel.forge({ id });
            try {
                const shippingPriceUpdated = yield shippingPrice.save(data, { patch: true });
                return this.ShippingPriceModel.fetchById(shippingPriceUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the shippingPrice!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let shippingPrice = this.ShippingPriceModel.forge({ id });
            try {
                shippingPrice = yield shippingPrice.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield shippingPrice.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the shippingPrice!', error);
            }
        });
    }
};
ShippingPriceRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ShippingPrice)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ShippingPriceRepository);
exports.ShippingPriceRepository = ShippingPriceRepository;
//# sourceMappingURL=ShippingPriceRepository.js.map