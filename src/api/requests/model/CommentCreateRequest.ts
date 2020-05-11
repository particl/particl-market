// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

export class CommentCreateRequest extends RequestBody implements ModelRequestInterface {

    public msgid: string;

    public parentCommentId: number;

    @IsNotEmpty()
    public hash: string;

    @IsNotEmpty()
    public sender: string;

    @IsNotEmpty()
    public receiver: string;

    @IsNotEmpty()
    public type: string;

    @IsNotEmpty()
    public target: string;

    @IsNotEmpty()
    public message: string;

    @IsNotEmpty()
    public postedAt: number;

    @IsNotEmpty()
    public expiredAt: number;

    @IsNotEmpty()
    public receivedAt: number;

}
