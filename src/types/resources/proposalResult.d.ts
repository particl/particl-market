// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface ProposalResult {
        id: number;
        block: number;
        Proposal: Proposal;
        ProposalOptionResults: ProposalOptionResult[];

        createdAt: Date;
        updatedAt: Date;
    }

}
