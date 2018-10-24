// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ProposalType } from '../../api/enums/ProposalType';

declare module 'resources' {

    interface Proposal {
        id: number;
        submitter: string;
        hash: string;
        item: string;
        type: ProposalType;
        title: string;
        description: string;
        startTime: number;
        expiryTime: number;
        receivedAt: number;
        postedAt: number;
        expiredAt: number;
        createdAt: Date;
        updatedAt: Date;
        ProposalOptions: ProposalOption[];
        ProposalResults: ProposalResult[];
        ListingItem: ListingItem;
    }

}
