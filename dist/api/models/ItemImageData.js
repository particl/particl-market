"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ItemImage_1 = require("./ItemImage");
class ItemImageData extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ItemImageData.where({ id: value }).fetch({
                    withRelated: []
                });
            }
            else {
                return yield ItemImageData.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'item_image_datas'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Protocol() { return this.get('protocol'); }
    set Protocol(value) { this.set('protocol', value); }
    get Encoding() { return this.get('encoding'); }
    set Encoding(value) { this.set('encoding', value); }
    get ImageVersion() { return this.get('imageVersion'); }
    set ImageVersion(value) { this.set('imageVersion', value); }
    get DataId() { return this.get('dataId'); }
    set DataId(value) { this.set('dataId', value); }
    get Data() { return this.get('data'); }
    set Data(value) { this.set('data', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    get OriginalMime() { return this.get('originalMime'); }
    set OriginalMime(value) { this.set('originalMime', value); }
    get OriginalName() { return this.get('originalName'); }
    set OriginalName(value) { this.set('originalName', value); }
    ItemImage() {
        return this.belongsTo(ItemImage_1.ItemImage, 'item_image_id', 'id');
    }
}
exports.ItemImageData = ItemImageData;
//# sourceMappingURL=ItemImageData.js.map