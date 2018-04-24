"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
class ItemCategory extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ItemCategory.where({ id: value }).fetch({
                    withRelated: [
                        'ParentItemCategory',
                        'ParentItemCategory.ParentItemCategory',
                        'ParentItemCategory.ParentItemCategory.ParentItemCategory',
                        'ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
                        'ChildItemCategories'
                    ]
                });
            }
            else {
                return yield ItemCategory.where({ id: value }).fetch();
            }
        });
    }
    static fetchByKey(key, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ItemCategory.where({ key }).fetch({
                    withRelated: [
                        'ParentItemCategory',
                        'ParentItemCategory.ParentItemCategory',
                        'ParentItemCategory.ParentItemCategory.ParentItemCategory',
                        'ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
                        'ChildItemCategories'
                    ]
                });
            }
            else {
                return yield ItemCategory.where({ key }).fetch();
            }
        });
    }
    static fetchRoot() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield ItemCategory.where({ key: 'cat_ROOT' }).fetch({
                withRelated: [
                    'ChildItemCategories',
                    'ChildItemCategories.ChildItemCategories',
                    'ChildItemCategories.ChildItemCategories.ChildItemCategories',
                    'ChildItemCategories.ChildItemCategories.ChildItemCategories.ChildItemCategories'
                ]
            });
        });
    }
    static fetchAllByName(name, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const listingCollection = ItemCategory.forge()
                .query(qb => {
                qb.where('name', 'LIKE', '%' + name + '%');
            })
                .orderBy('id', 'ASC');
            if (withRelated) {
                return yield listingCollection.fetchAll({
                    withRelated: [
                        'ParentItemCategory',
                        'ParentItemCategory.ParentItemCategory',
                        'ParentItemCategory.ParentItemCategory.ParentItemCategory',
                        'ParentItemCategory.ParentItemCategory.ParentItemCategory.ParentItemCategory',
                        'ChildItemCategories'
                    ]
                });
            }
            else {
                return yield listingCollection.fetchAll();
            }
        });
    }
    static fetchCategoryByNameAndParentID(categoryName, parentCategoryId) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield ItemCategory.where({ name: categoryName, parent_item_category_id: parentCategoryId }).fetch();
        });
    }
    get tableName() { return 'item_categories'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Name() { return this.get('name'); }
    set Name(value) { this.set('name', value); }
    get Key() { return this.get('key'); }
    set Key(value) { this.set('key', value); }
    get Description() { return this.get('description'); }
    set Description(value) { this.set('description', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    // ItemCategory can haz a parent ItemCategory
    ParentItemCategory() {
        // model.hasOne(Target, [foreignKey], [foreignKeyTarget])
        // return this.hasOne(ItemCategory, 'parent_item_category_id', 'id');
        // model.belongsTo(Target, [foreignKey], [foreignKeyTarget])
        return this.belongsTo(ItemCategory, 'parent_item_category_id', 'id');
    }
    ChildItemCategories() {
        // model.hasMany(Target, [foreignKey], [foreignKeyTarget])
        return this.hasMany(ItemCategory, 'parent_item_category_id', 'id');
    }
}
exports.ItemCategory = ItemCategory;
//# sourceMappingURL=ItemCategory.js.map