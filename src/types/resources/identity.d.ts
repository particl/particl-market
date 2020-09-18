// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IdentityType } from '../../api/enums/IdentityType';

declare module 'resources' {

    interface Identity {
        id: number;
        wallet: string;
        address: string;
        hdseedid: string;
        path: string;
        mnemonic: string;
        passphrase: string;
        type: IdentityType;

        createdAt: Date;
        updatedAt: Date;

        Profile: Profile;
        Markets: Market[];
        ShoppingCarts: ShoppingCart[];
    }

}
