// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export class OrderItemStatusResponse {
    public listingItemId: number;
    public listingItemHash: string;
    public bidType: string;
    public orderStatus: string;
    public buyer: string;
    public seller: string;
}
