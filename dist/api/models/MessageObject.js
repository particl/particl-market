"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ActionMessage_1 = require("./ActionMessage");
class MessageObject extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield MessageObject.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield MessageObject.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'message_objects'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get DataId() { return this.get('data_id'); }
    set DataId(value) { this.set('data_id', value); }
    get DataValue() { return this.get('data_value'); }
    set DataValue(value) { this.set('data_value', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ActionMessage() {
        return this.belongsTo(ActionMessage_1.ActionMessage, 'action_message_id', 'id');
    }
}
MessageObject.RELATIONS = [];
exports.MessageObject = MessageObject;
//# sourceMappingURL=MessageObject.js.map