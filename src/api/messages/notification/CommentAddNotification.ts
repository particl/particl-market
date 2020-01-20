// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CommentAction } from '../../enums/CommentAction';
import { CommentType } from '../../enums/CommentType';
import { ActionNotificationInterface } from './ActionNotificationInterface';

export class CommentAddNotification implements ActionNotificationInterface {

    public type: CommentAction.MPA_COMMENT_ADD;
    public id: number;
    public hash: string;
    public target: string;

    public sender: string;
    public receiver: string;
    public commentType: CommentType;

    public parent: CommentAddNotification;

}
