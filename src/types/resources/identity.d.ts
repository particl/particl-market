// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE


declare module 'resources' {

    interface Identity {
        id: number;
        wallet: string;
        identitySpaddress: string;
        escrowSpaddress: string;
        txfeeSpaddress: string;
        walletHdseedid: string;

        createdAt: Date;
        updatedAt: Date;

        Profile: Profile;
        Markets: Market[];
    }

}
