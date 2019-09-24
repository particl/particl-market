// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { CommentType } from '../../enums/CommentType';
import { BaseSearchParams } from './BaseSearchParams';
import { CommentSearchOrderField} from '../../enums/SearchOrderField';

export class CommentSearchParams extends BaseSearchParams {

    public orderField = CommentSearchOrderField.POSTED_AT;
    public type: CommentType;
    public target: string;
    public parentCommentId: number;
}
