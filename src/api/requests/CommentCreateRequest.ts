// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { CommentMessageType } from '../enums/CommentMessageType';

// tslint:disable:variable-name
export class CommentCreateRequest extends RequestBody {
    @IsEnum(CommentMessageType)
    @IsNotEmpty()
    public action: CommentMessageType;

    @IsNotEmpty()
    public sender: string;

    @IsNotEmpty()
    public marketHash: string;

    @IsNotEmpty()
    public target: string; // listingItem hash

    public parentHash: string;

    public message: string;

    @IsNotEmpty()
    public postedAt: number;

    @IsNotEmpty()
    public receivedAt: number;

    @IsNotEmpty()
    public updatedAt: number;

    public hash: string;
}
// tslint:enable:variable-name
