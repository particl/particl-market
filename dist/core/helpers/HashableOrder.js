"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class HashableOrder {
    constructor(hashThis) {
        this.itemHashes = [];
        const input = JSON.parse(JSON.stringify(hashThis));
        if (input) {
            this.buyer = input.buyer;
            this.seller = input.seller;
            for (const item of input.orderItems) {
                this.itemHashes.push(item.itemHash);
            }
            // TODO: add fields that dont change in orderItemObjects
        }
    }
}
exports.HashableOrder = HashableOrder;
//# sourceMappingURL=HashableOrder.js.map