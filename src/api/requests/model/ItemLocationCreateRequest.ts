// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { LocationMarkerCreateRequest } from './LocationMarkerCreateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class ItemLocationCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public item_information_id: number;

    @IsNotEmpty()
    public country: string;
    public address: string;
    public description: string;

    public locationMarker: LocationMarkerCreateRequest;

}
// tslint:enable:variable-name
