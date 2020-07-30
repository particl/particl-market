// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';
import { CommentType } from '../../enums/CommentType';

// tslint:disable:variable-name
export class CommentCreateRequest extends RequestBody implements ModelRequestInterface {

    public parent_comment_id: number;

    public msgid: string;

    @IsNotEmpty()
    public hash: string;

    @IsNotEmpty()
    public sender: string;

    @IsNotEmpty()
    public receiver: string;

    @IsNotEmpty()
    public type: CommentType;

    @IsNotEmpty()
    public target: string;

    @IsNotEmpty()
    public message: string;

    @IsNotEmpty()
    public generatedAt: number;

    @IsNotEmpty()
    public postedAt: number;

    @IsNotEmpty()
    public expiredAt: number;

    @IsNotEmpty()
    public receivedAt: number;

}
// tslint:enable:variable-name
