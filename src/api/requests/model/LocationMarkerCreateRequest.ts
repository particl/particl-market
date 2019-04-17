// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class LocationMarkerCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public item_location_id: number;

    @IsNotEmpty()
    public lat: number;

    @IsNotEmpty()
    public lng: number;

    public markerTitle: string;
    public markerText: string;

}
// tslint:enable:variable-name
