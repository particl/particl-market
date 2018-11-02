// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface Vote {
        id: number;
        voter: string;
        weight: number;
        ProposalOption: ProposalOption;
        receivedAt: number;
        postedAt: number;
        expiredAt: number;
        createdAt: Date;
        updatedAt: Date;
    }

}
