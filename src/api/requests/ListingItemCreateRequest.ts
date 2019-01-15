// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { ActionMessageCreateRequest } from './ActionMessageCreateRequest';

// tslint:disable:variable-name
export class ListingItemCreateRequest extends RequestBody {

    public hash: string;

    @IsNotEmpty()
    public seller: string;

    @IsNotEmpty()
    public market_id: number;

    public listing_item_template_id: number;

    // in days
    @IsNotEmpty()
    public expiryTime: number;

    @IsNotEmpty()
    public postedAt: number;
    @IsNotEmpty()
    public expiredAt: number;
    @IsNotEmpty()
    public receivedAt: number;

    public itemInformation;
    public paymentInformation;
    public messagingInformation;
    public listingItemObjects;
}
// tslint:enable:variable-name
