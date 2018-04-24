"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ActionMessage_1 = require("./ActionMessage");
class MessageData extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield MessageData.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield MessageData.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'message_datas'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Msgid() { return this.get('msgid'); }
    set Msgid(value) { this.set('msgid', value); }
    get Version() { return this.get('version'); }
    set Version(value) { this.set('version', value); }
    get Received() { return this.get('received'); }
    set Received(value) { this.set('received', value); }
    get Sent() { return this.get('sent'); }
    set Sent(value) { this.set('sent', value); }
    get From() { return this.get('from'); }
    set From(value) { this.set('from', value); }
    get To() { return this.get('to'); }
    set To(value) { this.set('to', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ActionMessage() {
        return this.belongsTo(ActionMessage_1.ActionMessage, 'action_message_id', 'id');
    }
}
MessageData.RELATIONS = [];
exports.MessageData = MessageData;
//# sourceMappingURL=MessageData.js.map