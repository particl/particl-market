// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CommentType } from '../../enums/CommentType';
import { BaseSearchParams } from './BaseSearchParams';

export class CommentSearchParams extends BaseSearchParams {

    public type: CommentType;
    public target: string;
    public parentCommentId: number;
}
