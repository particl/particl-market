// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';

declare module 'resources' {


    interface MessagingInformation {
        id: number;
        protocol: MessagingProtocol;
        publicKey: string;
        createdAt: Date;
        updatedAt: Date;
    }

}
