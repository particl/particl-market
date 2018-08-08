// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';

// tslint:disable:variable-name
export class ListingItemTemplateSearchParams extends RequestBody {

    @IsNotEmpty()
    public page: number;

    @IsNotEmpty()
    public pageLimit: number;

    @IsNotEmpty()
    @IsEnum(SearchOrder)
    public order: SearchOrder;

    @IsNotEmpty()
    public profileId: number;

    public category: string | number;

    public searchString: string;

}
// tslint:enable:variable-name
