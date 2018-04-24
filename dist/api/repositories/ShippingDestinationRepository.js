"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ShippingDestinationRepository = class ShippingDestinationRepository {
    constructor(ShippingDestinationModel, Logger) {
        this.ShippingDestinationModel = ShippingDestinationModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ShippingDestinationModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ShippingDestinationModel.fetchById(id, withRelated);
        });
    }
    /**
     * options:
     *  item_information_id: options.item_information_id
     *  country: options.options
     *  shipping_availability: options.shipping_availability
     *
     * @param options
     * @returns {Promise<ShippingDestination>}
     */
    search(options) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ShippingDestinationModel.searchBy(options);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shippingDestination = this.ShippingDestinationModel.forge(data);
            try {
                const shippingDestinationCreated = yield shippingDestination.save();
                return this.ShippingDestinationModel.fetchById(shippingDestinationCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the shippingDestination!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const shippingDestination = this.ShippingDestinationModel.forge({ id });
            try {
                const shippingDestinationUpdated = yield shippingDestination.save(data, { patch: true });
                return this.ShippingDestinationModel.fetchById(shippingDestinationUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the shippingDestination!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let shippingDestination = this.ShippingDestinationModel.forge({ id });
            try {
                shippingDestination = yield shippingDestination.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield shippingDestination.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the shippingDestination!', error);
            }
        });
    }
};
ShippingDestinationRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ShippingDestination)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ShippingDestinationRepository);
exports.ShippingDestinationRepository = ShippingDestinationRepository;
//# sourceMappingURL=ShippingDestinationRepository.js.map