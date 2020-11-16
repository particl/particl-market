// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CommentAction } from '../../enums/CommentAction';
import { CommentCategory } from '../../enums/CommentCategory';
import { ActionNotificationInterface } from './ActionNotificationInterface';


export class CommentAddNotification implements ActionNotificationInterface {
    public objectId: number;
    public objectHash: string;

    public target: string;              // comment target, for example ListingItem

    public from: string;                // was: sender
    public to: string;                  // was: receiver

    public category: CommentCategory;   // was: commentType

    public parentObjectId?: number;     // was: parent: CommentAddNotification
    public parentObjectHash?: string;   // was: parent: CommentAddNotification
}
