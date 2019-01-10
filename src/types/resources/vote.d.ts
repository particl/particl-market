// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface Vote {
        id: number;
        voter: string;
        old_weight: number;

        postedAt: number;
        receivedAt: number;
        expiredAt: number;

        ProposalOption: ProposalOption;

        createdAt: Date;
        updatedAt: Date;
    }

}
