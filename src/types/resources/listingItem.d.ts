// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface ListingItem {
        id: number;
        hash: string;
        seller: string;
        createdAt: Date;
        updatedAt: Date;
        ItemInformation: ItemInformation;
        PaymentInformation: PaymentInformation;
        MessagingInformation: MessagingInformation[];
        ListingItemObjects: ListingItemObject[];
        Market: Market;
        Bids: Bid[];
        ActionMessages: ActionMessage[];
        ListingItemTemplate: ListingItemTemplate;
    }

}
