"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ItemImageDataRepository = class ItemImageDataRepository {
    constructor(ItemImageDataModel, Logger) {
        this.ItemImageDataModel = ItemImageDataModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ItemImageDataModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemImageDataModel.fetchById(id, withRelated);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemImageData = this.ItemImageDataModel.forge(data);
            try {
                const itemImageDataCreated = yield itemImageData.save();
                return this.ItemImageDataModel.fetchById(itemImageDataCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the itemImageData!', error);
            }
        });
    }
    update(id, data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemImageData = this.ItemImageDataModel.forge({ id });
            try {
                const itemImageDataUpdated = yield itemImageData.save(data, { patch: true });
                return this.ItemImageDataModel.fetchById(itemImageDataUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the itemImageData!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let itemImageData = this.ItemImageDataModel.forge({ id });
            try {
                itemImageData = yield itemImageData.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield itemImageData.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the itemImageData!', error);
            }
        });
    }
};
ItemImageDataRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ItemImageData)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ItemImageDataRepository);
exports.ItemImageDataRepository = ItemImageDataRepository;
//# sourceMappingURL=ItemImageDataRepository.js.map