// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ItemCategoryUpdateRequest } from './ItemCategoryUpdateRequest';
import { ItemLocationCreateRequest } from './ItemLocationCreateRequest';
import { ShippingDestinationCreateRequest } from './ShippingDestinationCreateRequest';
import { ImageCreateRequest } from './ImageCreateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';
import { ItemCategoryCreateRequest } from './ItemCategoryCreateRequest';

// tslint:disable:variable-name
export class ItemInformationCreateRequest extends RequestBody implements ModelRequestInterface {

    public listing_item_id: number;
    public listing_item_template_id: number;

    @IsNotEmpty()
    public title: string;

    @IsNotEmpty()
    public shortDescription: string;
    public longDescription: string;

    public itemCategory: ItemCategoryCreateRequest | ItemCategoryUpdateRequest;
    public item_category_id: number;

    public itemLocation: ItemLocationCreateRequest;
    public shippingDestinations: ShippingDestinationCreateRequest[];
    public images: ImageCreateRequest[];

}
// tslint:enable:variable-name
