"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
class ItemImageDataContent extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ItemImageDataContent.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ItemImageDataContent.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'item_image_data_contents'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Data() { return this.get('data'); }
    set Data(value) { this.set('data', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
}
ItemImageDataContent.RELATIONS = [];
exports.ItemImageDataContent = ItemImageDataContent;
//# sourceMappingURL=ItemImageDataContent.js.map