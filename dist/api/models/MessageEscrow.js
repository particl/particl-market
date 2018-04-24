"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const ActionMessage_1 = require("./ActionMessage");
class MessageEscrow extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield MessageEscrow.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield MessageEscrow.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'message_escrows'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get Type() { return this.get('type'); }
    set Type(value) { this.set('type', value); }
    get Rawtx() { return this.get('rawtx'); }
    set Rawtx(value) { this.set('rawtx', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    ActionMessage() {
        return this.belongsTo(ActionMessage_1.ActionMessage, 'action_message_id', 'id');
    }
}
MessageEscrow.RELATIONS = [];
exports.MessageEscrow = MessageEscrow;
//# sourceMappingURL=MessageEscrow.js.map