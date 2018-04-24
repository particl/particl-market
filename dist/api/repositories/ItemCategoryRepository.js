"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const DatabaseException_1 = require("../exceptions/DatabaseException");
const NotFoundException_1 = require("../exceptions/NotFoundException");
let ItemCategoryRepository = class ItemCategoryRepository {
    constructor(ItemCategoryModel, Logger) {
        this.ItemCategoryModel = ItemCategoryModel;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const list = yield this.ItemCategoryModel.fetchAll();
            return list;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemCategoryModel.fetchById(id, withRelated);
        });
    }
    findOneByKey(key, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemCategoryModel.fetchByKey(key, withRelated);
        });
    }
    findRoot() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.ItemCategoryModel.fetchRoot();
        });
    }
    findByName(name, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemCategoryModel.fetchAllByName(name, withRelated);
        });
    }
    isCategoryExists(categoryName, parentCategoryId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.ItemCategoryModel.fetchCategoryByNameAndParentID(categoryName, parentCategoryId);
        });
    }
    create(data) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemCategory = this.ItemCategoryModel.forge(data);
            try {
                const itemCategoryCreated = yield itemCategory.save();
                return this.ItemCategoryModel.fetchById(itemCategoryCreated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not create the itemCategory!', error);
            }
        });
    }
    update(id, data, patching = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemCategory = this.ItemCategoryModel.forge({ id });
            try {
                const itemCategoryUpdated = yield itemCategory.save(data, { defaults: true, patch: patching });
                return yield this.ItemCategoryModel.fetchById(itemCategoryUpdated.id);
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not update the itemCategory!', error);
            }
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let itemCategory = this.ItemCategoryModel.forge({ id });
            try {
                itemCategory = yield itemCategory.fetch({ require: true });
            }
            catch (error) {
                throw new NotFoundException_1.NotFoundException(id);
            }
            try {
                yield itemCategory.destroy();
                return;
            }
            catch (error) {
                throw new DatabaseException_1.DatabaseException('Could not delete the itemCategory!', error);
            }
        });
    }
};
ItemCategoryRepository = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Model)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Model.ItemCategory)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object, Object])
], ItemCategoryRepository);
exports.ItemCategoryRepository = ItemCategoryRepository;
//# sourceMappingURL=ItemCategoryRepository.js.map