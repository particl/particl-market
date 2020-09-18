// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface ShoppingCartItem {
        id: number;
        ShoppingCart: ShoppingCart;
        ListingItem: ListingItem;

        createdAt: Date;
        updatedAt: Date;
    }

}
