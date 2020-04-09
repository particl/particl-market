// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { SearchOrder } from '../../enums/SearchOrder';
import { ListingItemSearchOrderField } from '../../enums/SearchOrderField';

export class ListingItemSearchParams extends RequestBody {

    @IsNotEmpty()
    public page: number;
    @IsNotEmpty()
    public pageLimit: number;
    @IsNotEmpty()
    @IsEnum(SearchOrder)
    public order: SearchOrder;
    @IsEnum(ListingItemSearchOrderField)
    public orderField: ListingItemSearchOrderField;

    public market: string;
    public categories: string[] | number[];
    public seller: string;
    public minPrice: number;
    public maxPrice: number;
    public country: string;
    public shippingDestination: string;
    public searchString: string;
    public flagged: boolean;

    public listingItemHash: string;
    public withBids: boolean;
    public buyer: string;
    public msgid: string;

}
