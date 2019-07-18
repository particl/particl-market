// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { SearchOrder } from '../../enums/SearchOrder';
import { CommentType } from '../../enums/CommentType';

export class CommentSearchParams extends RequestBody {

    public commentHash: string;

    public page: number;

    public pageLimit: number;

    @IsEnum(SearchOrder)
    public order: SearchOrder;

    public orderField: string;

    public type: CommentType;

    public target: string;
}
