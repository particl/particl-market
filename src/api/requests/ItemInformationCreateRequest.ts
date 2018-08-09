// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ItemInformationCreateRequest extends RequestBody {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsNotEmpty()
    public title: string;

    @IsNotEmpty()
    public shortDescription: string;

    @IsNotEmpty()
    public longDescription: string;

    public itemCategory;
    public itemLocation;
    public shippingDestinations;
    public itemImages;

}
// tslint:enable:variable-name
