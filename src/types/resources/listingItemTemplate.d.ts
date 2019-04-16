// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface ListingItemTemplate {
        id: number;
        hash: string;
        generatedAt: number;
        ItemInformation: ItemInformation;
        PaymentInformation: PaymentInformation;
        MessagingInformation: MessagingInformation[];
        ListingItemObjects: ListingItemObject[];
        ListingItems: ListingItem[];
        Profile: Profile;
        createdAt: Date;
        updatedAt: Date;
    }

}
