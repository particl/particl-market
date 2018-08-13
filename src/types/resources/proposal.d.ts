// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ProposalType } from '../../api/enums/ProposalType';

declare module 'resources' {

    interface Proposal {
        id: number;
        submitter: string;
        blockStart: number;
        blockEnd: number;
        hash: string;
        type: ProposalType;
        title: string;
        description: string;
        createdAt: Date;
        updatedAt: Date;
        ProposalOptions: ProposalOption[];
        ProposalResult: ProposalResult;
        ListingItem: ListingItem;
    }

}
