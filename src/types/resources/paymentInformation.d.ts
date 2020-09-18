// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { SaleType } from 'omp-lib/dist/interfaces/omp-enums';

declare module 'resources' {

    interface PaymentInformation {
        id: number;
        type: SaleType;

        Escrow: Escrow;
        ItemPrice: ItemPrice;

        createdAt: Date;
        updatedAt: Date;
    }

}
