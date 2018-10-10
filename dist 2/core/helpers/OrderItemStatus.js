"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
class OrderItemStatus {
    constructor(listingItemHash = '', bidType = '', orderStatus = '', buyer = '', seller = '') {
        this.listingItemHash = listingItemHash;
        this.bidType = bidType;
        this.orderStatus = orderStatus;
        this.buyer = buyer;
        this.seller = seller;
    }
}
exports.OrderItemStatus = OrderItemStatus;
//# sourceMappingURL=OrderItemStatus.js.map