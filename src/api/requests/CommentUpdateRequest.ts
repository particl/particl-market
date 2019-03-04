// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { CommentMessageType } from '../enums/CommentMessageType';
import { CommentType } from '../enums/CommentType';

// tslint:disable:variable-name
export class CommentUpdateRequest extends RequestBody {

    // public hash: string; // updated in service
    public sender: string;
    public receiver: string;
    public target: string;
    public hash: string;
    public message: string;
    public type: CommentType;
    public postedAt: number;
    public receivedAt: number;
    public expiredAt: number;

}
// tslint:enable:variable-name
