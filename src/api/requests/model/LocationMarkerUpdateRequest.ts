// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class LocationMarkerUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public lat: number;

    @IsNotEmpty()
    public lng: number;

    public title: string;
    public description: string;

}
// tslint:enable:variable-name
