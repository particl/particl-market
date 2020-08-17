// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';
import { MarketType } from '../../enums/MarketType';

// tslint:disable:variable-name
export class MarketUpdateRequest extends RequestBody implements ModelRequestInterface {

    public msgid: string;
    public hash: string;

    @IsNotEmpty()
    public name: string;
    public description: string;

    @IsNotEmpty()
    public type: MarketType;

    @IsNotEmpty()
    public receiveKey: string;

    @IsNotEmpty()
    public receiveAddress: string;

    public publishKey: string;
    public publishAddress: string;

    public removed: boolean;
    public expiryTime: number;
    public generatedAt: number;
    public receivedAt: number;
    public postedAt: number;
    public expiredAt: number;

    public identity_id: number;
    public image_id: number;

}
// tslint:enable:variable-name
