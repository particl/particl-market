// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface CryptocurrencyAddress {
        id: number;
        type: string;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }

}
