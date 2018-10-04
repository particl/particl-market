// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import {SmsgMessageStatus} from '../enums/SmsgMessageStatus';

// tslint:disable:variable-name
export class SmsgMessageUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public type: string;

    @IsNotEmpty()
    public status: SmsgMessageStatus;

    @IsNotEmpty()
    public msgid: string;

    @IsNotEmpty()
    public version: string;

    public read: boolean;
    public paid: boolean;
    public payloadsize: number;

    @IsNotEmpty()
    public received: number;

    @IsNotEmpty()
    public sent: number;

    @IsNotEmpty()
    public expiration: number;

    @IsNotEmpty()
    public daysretention: number;

    @IsNotEmpty()
    public from: string;

    @IsNotEmpty()
    public to: string;

    public text: string;

}
// tslint:enable:variable-name
