// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class SettingCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public key: string;

    @IsNotEmpty()
    public value: string;

    public profile_id: number;
    public market_id: number;

}
// tslint:enable:variable-name
