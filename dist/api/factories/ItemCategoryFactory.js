"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const inversify_1 = require("inversify");
const _ = require("lodash");
const constants_1 = require("../../constants");
let ItemCategoryFactory = class ItemCategoryFactory {
    constructor(Logger) {
        this.Logger = Logger;
        this.log = new Logger(__filename);
    }
    /**
     * Converts a category to an array of category keys
     * ['rootcatkey', 'subcatkey', ..., 'catkey']
     *
     * @param category : resources.ItemCategory
     * @param rootCategoryWithRelated : resources.ItemCategory
     * @returns {Promise<string[]>}
     */
    getArray(category) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.getArrayInner(category);
        });
    }
    /**
     *
     * @param {string[]} categoryArray
     * @param {"resources".ItemCategory} rootCategory
     * @returns {Promise<"resources".ItemCategory>}
     */
    getModel(categoryArray, rootCategory) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (const categoryKeyOrName of categoryArray) {
                rootCategory = yield this.findCategory(rootCategory, categoryKeyOrName);
            }
            return {
                parent_item_category_id: rootCategory.parentItemCategoryId,
                key: rootCategory.key,
                name: rootCategory.name,
                description: rootCategory.description
            };
        });
    }
    /**
     * return the ChildCategory having the given key or name
     *
     * @param {"resources".ItemCategory} rootCategory
     * @param {string} keyOrName
     * @returns {Promise<"resources".ItemCategory>}
     */
    findCategory(rootCategory, keyOrName) {
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
    /**
     *
     * @param {"resources".ItemCategory} category
     * @param {string[]} categoryArray
     * @returns {Promise<string[]>}
     */
    getArrayInner(category, categoryArray = []) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // add category key to beginning of the array
            categoryArray.unshift(category.key);
            // if category has ParentItemCategory, add it's key to array
            if (!_.isEmpty(category.ParentItemCategory)) {
                return yield this.getArrayInner(category.ParentItemCategory, categoryArray);
            }
            return categoryArray;
        });
    }
};
ItemCategoryFactory = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(0, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [Object])
], ItemCategoryFactory);
exports.ItemCategoryFactory = ItemCategoryFactory;
//# sourceMappingURL=ItemCategoryFactory.js.map