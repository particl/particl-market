// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';
import { SearchOrder } from '../enums/SearchOrder';
import { OrderStatus } from '../enums/OrderStatus';
import {CommentType} from '../enums/CommentType';

// tslint:disable:variable-name
export class CommentSearchParams extends RequestBody {

    @IsNotEmpty()
    public marketId: number;

    public commentHash: string;

    public page: number;

    public pageLimit: number;

    @IsEnum(SearchOrder)
    public order: SearchOrder;

    public orderField: string;

    public type: CommentType;

    public target: string;
}
// tslint:enable:variable-name
