// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionNotificationInterface } from './ActionNotificationInterface';
import { ProposalCategory } from '../../enums/ProposalCategory';
import { GovernanceAction } from '../../enums/GovernanceAction';

export class ProposalNotification implements ActionNotificationInterface {
    public objectId: number;
    public objectHash: string;

    public from: string;
    public to: string;

    public category: ProposalCategory;
    public target: string;
    public market: string;
}
