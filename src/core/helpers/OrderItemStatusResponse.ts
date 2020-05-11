// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export class OrderItemStatusResponse {
    public listingItemHash: string;
    public bidType: string;
    public orderStatus: string;
    public buyer: string;
    public seller: string;

    constructor(listingItemHash: string = '', bidType: string = '', orderStatus: string = '', buyer: string = '', seller: string = '') {
        this.listingItemHash = listingItemHash;
        this.bidType = bidType;
        this.orderStatus = orderStatus;
        this.buyer = buyer;
        this.seller = seller;
    }
}
