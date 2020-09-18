// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface Vote {
        id: number;
        msgid: string;
        voter: string;
        weight: number;
        signature: string;

        postedAt: number;
        receivedAt: number;
        expiredAt: number;

        ProposalOption: ProposalOption;

        createdAt: number;
        updatedAt: number;
    }

}
