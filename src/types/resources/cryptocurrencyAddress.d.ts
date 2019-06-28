// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CryptoAddressType } from 'omp-lib/dist/interfaces/crypto';

declare module 'resources' {

    interface CryptocurrencyAddress {
        id: number;
        type: CryptoAddressType;
        address: string;
        createdAt: Date;
        updatedAt: Date;
    }

}
