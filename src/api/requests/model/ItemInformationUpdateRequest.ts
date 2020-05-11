// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ItemCategoryUpdateRequest } from './ItemCategoryUpdateRequest';
import { ItemLocationCreateRequest } from './ItemLocationCreateRequest';
import { ShippingDestinationCreateRequest } from './ShippingDestinationCreateRequest';
import { ItemImageCreateRequest } from './ItemImageCreateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class ItemInformationUpdateRequest extends RequestBody implements ModelRequestInterface {

    public id: number;

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsNotEmpty()
    public title: string;

    @IsNotEmpty()
    public shortDescription: string;

    @IsNotEmpty()
    public longDescription: string;

    public itemCategory: ItemCategoryUpdateRequest;
    public item_category_id: number;

    public itemLocation: ItemLocationCreateRequest;
    public shippingDestinations: ShippingDestinationCreateRequest[];
    public itemImages: ItemImageCreateRequest[];
}
// tslint:enable:variable-name
