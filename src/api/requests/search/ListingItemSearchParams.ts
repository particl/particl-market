// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { SearchOrder } from '../../enums/SearchOrder';
import { ListingItemSearchType } from '../../enums/ListingItemSearchType';

// tslint:disable:variable-name
export class ListingItemSearchParams extends RequestBody {

    @IsNotEmpty()
    public page: number;
    @IsNotEmpty()
    public pageLimit: number;
    @IsNotEmpty()
    @IsEnum(SearchOrder)
    public order: SearchOrder;
    public category: string | number;
    // @ValidateIf(o => o.type)
    // @IsEnum(ListingItemSearchType)
    public type: ListingItemSearchType; // TODO: not used for anything
    public profileId: string | number;  // TODO: wtf is this? theres also buyer and seller?
    public minPrice: number | null;
    public maxPrice: number | null;
    public country: string;
    public shippingDestination: string;
    public searchString: string;
    public withRelated: boolean;
    public flagged: boolean;
    public itemHash: string | null;
    public seller: string | null;
    public buyer: string | null;
    public withBids: boolean;
    public showMyFlagged: boolean;

    /*
     *  [0]: page, number
     *  [1]: pageLimit, number
     *  [2]: order, SearchOrder
     *  [3]: category, number|string, if string, try to find using key, can be null
     *  [4]: type (FLAGGED | PENDING | LISTED | IN_ESCROW | SHIPPED | SOLD | EXPIRED | ALL)
     *  [5]: profileId, (NUMBER | OWN | ALL | *)
     *  [6]: minPrice, number to searchBy item basePrice between 2 range
     *  [7]: maxPrice, number to searchBy item basePrice between 2 range
     *  [8]: country, string, can be null
     *  [9]: shippingDestination, string, can be null
     *  [10]: searchString, string, can be null
     *  [11]: flagged, boolean, can be null
     *  [12]: withRelated, boolean
     *  [13]: showMyFlagged, boolean
     */
    constructor(generateParams: any[] = []) {
        super(generateParams);
        // set params only if there are some -> by default all are true
        // if (!_.isEmpty(generateParams) ) {
        this.page                   = generateParams[0] ? generateParams[0] : 0;
        this.pageLimit              = generateParams[1] ? generateParams[1] : 10;
        this.order                  = generateParams[2] ? generateParams[2] : SearchOrder.ASC;
        this.category               = generateParams[3] ? generateParams[3] : '';
        this.type                   = ListingItemSearchType.ALL;
        this.profileId              = generateParams[5] ? generateParams[5] : 'ALL';
        this.minPrice               = generateParams[6] ? generateParams[6] : null;
        this.maxPrice               = generateParams[7] ? generateParams[7] : null;
        this.country                = generateParams[8] ? generateParams[8] : '';
        this.shippingDestination    = generateParams[9] ? generateParams[9] : '';
        this.searchString           = generateParams[10] ? generateParams[10] : '';
        this.flagged                = generateParams[11] ? generateParams[11] : false;
        this.withRelated            = generateParams[12] ? generateParams[12] : true;
        this.showMyFlagged          = generateParams[13] ? generateParams[13] : false;
        // }
        this.itemHash = null;
        this.seller = null;
        this.buyer = null;
        this.withBids = false;
    }

    public toParamsArray(): any[] {
        return [
            this.page,
            this.pageLimit,
            this.order,
            this.category,
            this.type,
            this.profileId,
            this.minPrice,
            this.maxPrice,
            this.country,
            this.shippingDestination,
            this.searchString,
            this.flagged,
            this.withRelated,
            this.showMyFlagged
        ];
    }
}
// tslint:enable:variable-name
