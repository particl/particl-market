// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CommentCategory } from '../../api/enums/CommentCategory';

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
        commentType: CommentCategory;
        generatedAt: number;

        postedAt: number;
        expiredAt: number;
        receivedAt: number;

        updatedAt: number;
        createdAt: number;

        ParentComment: Comment;
        ChildComments: Comment[];
    }

}
