// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { OrderCreateRequest } from '../../requests/model/OrderCreateRequest';
import { OrderItemCreateRequest } from '../../requests/model/OrderItemCreateRequest';

/**
 * core.api.HashableOrder
 *
 */

export class HashableOrder {

    public buyer: string;
    public seller: string;
    public itemHashes = '';

    constructor(hashThis: OrderCreateRequest) {
        const input: OrderCreateRequest = JSON.parse(JSON.stringify(hashThis));

        if (input) {
            this.buyer = input.buyer;
            this.seller = input.seller;
            // input.orderItems = input.orderItems.sort();

            input.orderItems.sort((a: OrderItemCreateRequest, b: OrderItemCreateRequest) => {
                if (a.itemHash < b.itemHash) {
                    return 1;
                }
                if (a.itemHash > b.itemHash) {
                    return -1;
                }
                return 0;
            });

            for (const item of input.orderItems) {
                this.itemHashes = this.itemHashes + item.itemHash + ':';
            }

            // TODO: add fields that dont change in orderItemObjects
        }
    }

}
