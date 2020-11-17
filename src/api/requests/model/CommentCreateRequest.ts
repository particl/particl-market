// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';
import { CommentCategory } from '../../enums/CommentCategory';

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
    public type: CommentCategory;

    @IsNotEmpty()
    public target: string;

    @IsNotEmpty()
    public message: string;

    public generatedAt: number;
    public postedAt: number;
    public expiredAt: number;
    public receivedAt: number;

}
// tslint:enable:variable-name
