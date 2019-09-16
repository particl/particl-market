// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class ListingItemUpdateRequest extends RequestBody implements ModelRequestInterface {

    public hash: string;
    public removed: boolean;

    @IsNotEmpty()
    public seller: string;

    public market: string;

    public itemInformation;
    public paymentInformation;
    public messagingInformation;
    public listingItemObjects;

}
// tslint:enable:variable-name
