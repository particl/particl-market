// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ListingItemObjectType } from '../../enums/ListingItemObjectType';
import { ModelRequestInterface } from './ModelRequestInterface';
import {ListingItemObjectDataUpdateRequest} from './ListingItemObjectDataUpdateRequest';

// tslint:disable:variable-name
export class ListingItemObjectUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsEnum(ListingItemObjectType)
    @IsNotEmpty()
    public type: ListingItemObjectType;

    @IsNotEmpty()
    public description: string;

    @IsNotEmpty()
    public order: number;

    public listingItemObjectDatas: ListingItemObjectDataUpdateRequest;
}
// tslint:enable:variable-name
