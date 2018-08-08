// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface User {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        auth0UserId: string;
        picture: string;
        createdAt: Date;
        updatedAt: Date;
    }

}
