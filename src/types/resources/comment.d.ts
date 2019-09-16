// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

declare module 'resources' {

    interface Comment {
        id: number;
        hash: string;
        sender: string;
        receiver: string;
        type: string;
        target: string;
        message: string;

        postedAt: number;
        expiredAt: number;
        receivedAt: number;

        updatedAt: number;
        createdAt: number;

        ParentComment: Comment;
        ChildComments: Comment[];
    }

}
