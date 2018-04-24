"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const _ = require("lodash");
const inversify_1 = require("inversify");
const constants_1 = require("../../constants");
const Validate_1 = require("../../core/api/Validate");
const NotFoundException_1 = require("../exceptions/NotFoundException");
const ItemCategoryRepository_1 = require("../repositories/ItemCategoryRepository");
const ItemCategoryCreateRequest_1 = require("../requests/ItemCategoryCreateRequest");
const ItemCategoryUpdateRequest_1 = require("../requests/ItemCategoryUpdateRequest");
let ItemCategoryService = class ItemCategoryService {
    constructor(itemCategoryRepo, Logger) {
        this.itemCategoryRepo = itemCategoryRepo;
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    findAll() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.itemCategoryRepo.findAll();
        });
    }
    findOneByKey(key, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemCategory = yield this.itemCategoryRepo.findOneByKey(key, withRelated);
            return itemCategory;
        });
    }
    findOne(id, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemCategory = yield this.itemCategoryRepo.findOne(id, withRelated);
            if (itemCategory === null) {
                this.log.warn(`ItemCategory with the id=${id} was not found!`);
                throw new NotFoundException_1.NotFoundException(id);
            }
            return itemCategory;
        });
    }
    findRoot() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.itemCategoryRepo.findRoot();
        });
    }
    findByName(name, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.itemCategoryRepo.findByName(name, withRelated);
        });
    }
    // todo: rename as categoryExists
    // find by name and parent_item_category_id
    isCategoryExists(categoryName, parentCategory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let parentCategoryId = null;
            if (!_.isEmpty(parentCategory)) {
                parentCategoryId = parentCategory.id;
            }
            return yield this.itemCategoryRepo.isCategoryExists(categoryName, parentCategoryId);
        });
    }
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (body.parent_item_category_id === 0) {
                delete body.parent_item_category_id;
            }
            // If the request body was valid we will create the itemCategory
            const itemCategory = yield this.itemCategoryRepo.create(body);
            // finally find and return the created itemCategory
            const newItemCategory = yield this.findOne(itemCategory.Id);
            return newItemCategory;
        });
    }
    update(id, body, patching = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // find the existing one without related
            const itemCategory = yield this.findOne(id, false);
            // set new values
            itemCategory.Name = body.name;
            itemCategory.Description = body.description;
            // need to set this to null, otherwise it won't get updated
            // itemCategory.parent_item_category_id = body.parentItemCategoryId === undefined ? null : body.parent_item_category_id;
            // update itemCategory record
            const updatedItemCategory = yield this.itemCategoryRepo.update(id, itemCategory.toJSON(), patching);
            return updatedItemCategory;
        });
    }
    destroy(id) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.itemCategoryRepo.destroy(id);
        });
    }
    /**
     * create categories from array and will return last category <ItemCategory> Model
     *
     * @param categoryArray : string[]
     * @returns {Promise<ItemCategory>}
     */
    createCategoriesFromArray(categoryArray) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const rootCategoryWithRelatedModel = yield this.findRoot();
            let rootCategoryToSearchFrom = rootCategoryWithRelatedModel.toJSON();
            this.log.debug('categoryArray', categoryArray);
            for (const categoryKeyOrName of categoryArray) {
                let existingCategory = yield this.findChildCategoryByKeyOrName(rootCategoryToSearchFrom, categoryKeyOrName);
                if (!existingCategory) {
                    // category did not exist, so we need to create it
                    const categoryCreateRequest = {
                        name: categoryKeyOrName,
                        parent_item_category_id: rootCategoryToSearchFrom.id
                    };
                    // create and assign it as existingCategoru
                    const newCategory = yield this.create(categoryCreateRequest);
                    existingCategory = newCategory.toJSON();
                }
                else {
                    // category exists, fetch it
                    const existingCategoryModel = yield this.findOneByKey(categoryKeyOrName);
                    existingCategory = existingCategoryModel.toJSON();
                }
                rootCategoryToSearchFrom = existingCategory;
            }
            // return the last category
            return rootCategoryToSearchFrom;
        });
    }
    /**
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    findChildCategoryByKeyOrName(rootCategory, keyOrName) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (rootCategory.key === keyOrName) {
                // root case
                return rootCategory;
            }
            else {
                // search the children for a match
                const childCategories = rootCategory.ChildItemCategories;
                return _.find(childCategories, (childCategory) => {
                    return (childCategory['key'] === keyOrName || childCategory['name'] === keyOrName);
                });
            }
        });
    }
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(ItemCategoryCreateRequest_1.ItemCategoryCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [ItemCategoryCreateRequest_1.ItemCategoryCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemCategoryService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(1, Validate_1.request(ItemCategoryUpdateRequest_1.ItemCategoryUpdateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Number, ItemCategoryUpdateRequest_1.ItemCategoryUpdateRequest, Boolean]),
    tslib_1.__metadata("design:returntype", Promise)
], ItemCategoryService.prototype, "update", null);
ItemCategoryService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Repository)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Repository.ItemCategoryRepository)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(1, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [ItemCategoryRepository_1.ItemCategoryRepository, Object])
], ItemCategoryService);
exports.ItemCategoryService = ItemCategoryService;
//# sourceMappingURL=ItemCategoryService.js.map