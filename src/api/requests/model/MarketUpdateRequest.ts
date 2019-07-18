// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';
import { MarketType } from '../../enums/MarketType';

// tslint:disable:variable-name
export class MarketUpdateRequest extends RequestBody implements ModelRequestInterface {
    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public type: MarketType;

    @IsNotEmpty()
    public receiveKey: string;

    @IsNotEmpty()
    public receiveAddress: string;

    public publishKey: string;
    public publishAddress: string;
    public wallet: string;
}
// tslint:enable:variable-name
