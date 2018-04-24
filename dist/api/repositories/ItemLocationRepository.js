"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ItemLocationRepository = class ItemLocationRepository {
    constructor(ItemLocationModel, Logger) {
        this.ItemLocationModel = ItemLocationModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ItemLocationModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemLocationModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemLocation = this.ItemLocationModel.forge(data);
            try {
                const itemLocationCreated = yield itemLocation.save();
                return this.ItemLocationModel.fetchById(itemLocationCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the itemLocation!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemLocation = this.ItemLocationModel.forge({ id });
            try {
                const itemLocationUpdated = yield itemLocation.save(data, { patch: true });
                return this.ItemLocationModel.fetchById(itemLocationUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the itemLocation!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let itemLocation = this.ItemLocationModel.forge({ id });
            try {
                itemLocation = yield itemLocation.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield itemLocation.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the itemLocation!', error);
            }
        });
    }
};
ItemLocationRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ItemLocation)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ItemLocationRepository);
exports.ItemLocationRepository = ItemLocationRepository;
//# sourceMappingURL=ItemLocationRepository.js.map