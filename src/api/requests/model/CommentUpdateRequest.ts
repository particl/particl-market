// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class CommentUpdateRequest extends RequestBody implements ModelRequestInterface {

    public parent_comment_id: number;

    // public msgid: string;
    public hash: string;
    public sender: string;
    public receiver: string;
    public type: string;
    public target: string;
    public message: string;

    public postedAt: number;
    public expiredAt: number;
    public receivedAt: number;

}
// tslint:enable:variable-name
