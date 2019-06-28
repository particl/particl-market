// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ShippingAddress } from 'omp-lib/dist/interfaces/omp';

declare module 'resources' {

    interface Address extends ShippingAddress {
        id: number;
        title: string;
        firstName: string;
        lastName: string;
        addressLine1: string;
        addressLine2: string;
        city: string;
        state: string;
        country: string;
        zipCode: string;
        createdAt: Date;
        updatedAt: Date;
        Profile: Profile;
    }

}
