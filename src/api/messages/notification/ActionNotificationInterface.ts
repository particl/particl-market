// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageTypes } from '../../enums/ActionMessageTypes';
import { CommentCategory } from '../../enums/CommentCategory';
import { ProposalCategory } from '../../enums/ProposalCategory';

export interface ActionNotificationInterface {
    objectId: number;               // which object this notication is about
    objectHash: string;
    parentObjectId?: number;
    parentObjectHash?: string;

    // everything below could be retrieved with the id or hash, so not necessarily needed
    target: string;                // possible target for the action the notification is about
    from: string;
    to: string;
    market: string;
    category?: CommentCategory | ProposalCategory;
}
