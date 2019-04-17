// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { LocationMarkerUpdateRequest } from './LocationMarkerUpdateRequest';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class ItemLocationUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public item_information_id: number;

    @IsNotEmpty()
    public country: string;
    public address: string;
    public description: string;

    public locationMarker: LocationMarkerUpdateRequest;

}
// tslint:enable:variable-name
