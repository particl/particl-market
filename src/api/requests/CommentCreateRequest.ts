// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { CommentMessageType } from '../enums/CommentMessageType';
import { CommentType } from '../enums/CommentType';

// tslint:disable:variable-name
export class CommentCreateRequest extends RequestBody {

    public parent_comment_id: number;

    @IsNotEmpty()
    public market_id: number;

    // public hash: string; // created in service

    @IsNotEmpty()
    public sender: string;

    @IsNotEmpty()
    public receiver: string;

    @IsNotEmpty()
    public target: string;

    @IsNotEmpty()
    public message: string;

    @IsEnum(CommentType)
    @IsNotEmpty()
    public type: CommentType;

    @IsNotEmpty()
    public postedAt: number;

    @IsNotEmpty()
    public receivedAt: number;

    @IsNotEmpty()
    public expiredAt: number;

}
// tslint:enable:variable-name
