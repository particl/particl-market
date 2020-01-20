// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CommentType } from '../../api/enums/CommentType';

declare module 'resources' {


    interface Comment {
        id: number;
        msgid: string;
        hash: string;
        sender: string;
        receiver: string;
        type: string;
        target: string;
        message: string;
        commentType: CommentType;

        postedAt: number;
        expiredAt: number;
        receivedAt: number;

        updatedAt: number;
        createdAt: number;

        ParentComment: Comment;
        ChildComments: Comment[];
    }

}
