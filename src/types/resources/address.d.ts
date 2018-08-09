// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface Address {
        id: number;
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
