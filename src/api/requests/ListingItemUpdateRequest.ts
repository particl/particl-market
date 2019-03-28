// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ListingItemUpdateRequest extends RequestBody {

    public hash: string;

    @IsNotEmpty()
    public seller: string;

    @IsNotEmpty()
    public market_id: number;

    public itemInformation;
    public paymentInformation;
    public messagingInformation;
    public listingItemObjects;

    public removed: boolean;
}
// tslint:enable:variable-name
