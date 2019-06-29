// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CommentType } from '../../api/enums/CommentType';

declare module 'resources' {

    interface Comment {
        id: number;
        hash: string;
        sender: string;
        receiver: string;
        target: string;
        message: string;
        type: CommentType;

        postedAt: number;
        expiredAt: number;
        createdAt: number;
        updatedAt: number;

        ParentComment: Comment;
        ChildComments: Comment[];
        Market: Market;
    }

}
