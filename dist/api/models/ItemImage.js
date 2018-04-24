"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ItemImageData_1 = require("./ItemImageData");
const ItemInformation_1 = require("./ItemInformation");
class ItemImage extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ItemImage.where({ id: value }).fetch({
                    withRelated: [
                        'ItemImageDatas',
                        'ItemInformation'
                    ]
                });
            }
            else {
                return yield ItemImage.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'item_images'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Hash() { return this.get('hash'); }
    set Hash(value) { this.set('hash', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ItemImageDatas() {
        return this.hasMany(ItemImageData_1.ItemImageData, 'item_image_id', 'id');
    }
    ItemInformation() {
        return this.belongsTo(ItemInformation_1.ItemInformation, 'item_information_id', 'id');
    }
}
exports.ItemImage = ItemImage;
//# sourceMappingURL=ItemImage.js.map