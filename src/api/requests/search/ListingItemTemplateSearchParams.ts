// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { SearchOrder } from '../../enums/SearchOrder';
import { SearchOrderField } from '../../enums/SearchOrderField';

// tslint:disable:variable-name
export class ListingItemTemplateSearchParams extends RequestBody {

    @IsNotEmpty()
    public page: number;

    @IsNotEmpty()
    public pageLimit: number;

    @IsNotEmpty()
    @IsEnum(SearchOrder)
    public order: SearchOrder;

    @IsEnum(SearchOrderField)
    public orderField: SearchOrderField;

    // @IsNotEmpty()
    public profileId: number;

    public searchString: string;

    public category: string | number;

    public hasItems: boolean;
}
// tslint:enable:variable-name
