"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const OrderItem_1 = require("./OrderItem");
class OrderItemObject extends Database_1.Bookshelf.Model {
    static fetchById(value, withRelated = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return yield OrderItemObject.where({ id: value }).fetch({
                    withRelated: this.RELATIONS
                });
            }
            else {
                return yield OrderItemObject.where({ id: value }).fetch();
            }
        });
    }
    get tableName() { return 'order_item_objects'; }
    get hasTimestamps() { return true; }
    get Id() { return this.get('id'); }
    set Id(value) { this.set('id', value); }
    get DataId() { return this.get('dataId'); }
    set DataId(value) { this.set('dataId', value); }
    get DataValue() { return this.get('dataValue'); }
    set DataValue(value) { this.set('dataValue', value); }
    get UpdatedAt() { return this.get('updatedAt'); }
    set UpdatedAt(value) { this.set('updatedAt', value); }
    get CreatedAt() { return this.get('createdAt'); }
    set CreatedAt(value) { this.set('createdAt', value); }
    OrderItem() {
        return this.belongsTo(OrderItem_1.OrderItem, 'order_item_id', 'id');
    }
}
OrderItemObject.RELATIONS = [
    'OrderItem'
];
exports.OrderItemObject = OrderItemObject;
//# sourceMappingURL=OrderItemObject.js.map