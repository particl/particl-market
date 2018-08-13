// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';

declare module 'resources' {

    interface ProposalOptionResult {
        id: number;
        proposalResultId: number;
        proposalOptionId: number;
        weight: number;
        voterCount: number;
        createdAt: Date;
        updatedAt: Date;
        ProposalOption: resources.ProposalOption;
    }

}
