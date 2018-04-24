"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const MessageObject_1 = require("./MessageObject");
const MessageInfo_1 = require("./MessageInfo");
const MessageEscrow_1 = require("./MessageEscrow");
const MessageData_1 = require("./MessageData");
const ListingItem_1 = require("./ListingItem");
class ActionMessage extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield ActionMessage.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield ActionMessage.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'action_messages'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Action() { return this.get('action'); }
    set Action(value) { this.set('action', value); }
    get Nonce() { return this.get('nonce'); }
    set Nonce(value) { this.set('nonce', value); }
    get Accepted() { return this.get('accepted'); }
    set Accepted(value) { this.set('accepted', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    MessageObjects() {
        return this.hasMany(MessageObject_1.MessageObject, 'action_message_id', 'id');
    }
    MessageInfo() {
        return this.hasOne(MessageInfo_1.MessageInfo);
    }
    MessageEscrow() {
        return this.hasOne(MessageEscrow_1.MessageEscrow);
    }
    MessageData() {
        return this.hasOne(MessageData_1.MessageData);
    }
    ListingItem() {
        return this.belongsTo(ListingItem_1.ListingItem, 'listing_item_id', 'id');
    }
}
ActionMessage.RELATIONS = [
    'ListingItem',
    'MessageObjects',
    'MessageInfo',
    'MessageEscrow',
    'MessageData'
];
exports.ActionMessage = ActionMessage;
//# sourceMappingURL=ActionMessage.js.map