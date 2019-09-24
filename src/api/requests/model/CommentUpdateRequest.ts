// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

export class CommentUpdateRequest extends RequestBody implements ModelRequestInterface {

    public msgid: string;
    public hash: string;
    public parentCommentId: number;

    public sender: string;

    public receiver: string;

    public type: string;

    public target: string;

    public message: string;

    public postedAt: number;
    public expiredAt: number;
    public receivedAt: number;

}
