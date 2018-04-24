"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ItemPriceRepository = class ItemPriceRepository {
    constructor(ItemPriceModel, Logger) {
        this.ItemPriceModel = ItemPriceModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ItemPriceModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemPriceModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemPrice = this.ItemPriceModel.forge(data);
            try {
                const itemPriceCreated = yield itemPrice.save();
                return this.ItemPriceModel.fetchById(itemPriceCreated.id);
            }
            catch (error) {
                this.log.error(error);
                throw new DatabaseException_1.DatabaseException('Could not create the itemPrice!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemPrice = this.ItemPriceModel.forge({ id });
            try {
                const itemPriceUpdated = yield itemPrice.save(data, { patch: true });
                return this.ItemPriceModel.fetchById(itemPriceUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the itemPrice!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let itemPrice = this.ItemPriceModel.forge({ id });
            try {
                itemPrice = yield itemPrice.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield itemPrice.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the itemPrice!', error);
            }
        });
    }
};
ItemPriceRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ItemPrice)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ItemPriceRepository);
exports.ItemPriceRepository = ItemPriceRepository;
//# sourceMappingURL=ItemPriceRepository.js.map