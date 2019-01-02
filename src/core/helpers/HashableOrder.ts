// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.api.HashableOrder
 *
 */
import { OrderCreateRequest } from '../../api/requests/OrderCreateRequest';

export class HashableOrder {

    public buyer: string;
    public seller: string;
    public itemHashes: string[] = [];

    constructor(hashThis: OrderCreateRequest) {
        const input = JSON.parse(JSON.stringify(hashThis));

        if (input) {
            this.buyer = input.buyer;
            this.seller = input.seller;
            for ( const item of input.orderItems) {
                this.itemHashes.push(item.itemHash);
            }
            // TODO: add fields that dont change in orderItemObjects
        }
    }

}
