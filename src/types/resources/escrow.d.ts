// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { EscrowType } from 'omp-lib/dist/interfaces/omp-enums';

declare module 'resources' {

    interface Escrow {
        id: number;
        type: EscrowType;
        createdAt: Date;
        updatedAt: Date;
        Ratio: EscrowRatio;
    }

}
