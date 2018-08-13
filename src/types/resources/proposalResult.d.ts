// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';

declare module 'resources' {

    interface ProposalResult {
        id: number;
        proposalId: number;
        block: number;
        createdAt: Date;
        updatedAt: Date;
        ProposalOptionResults: resources.ProposalOptionResult[];
    }

}
