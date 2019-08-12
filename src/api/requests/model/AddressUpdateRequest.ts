// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsDefined, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class AddressUpdateRequest extends RequestBody implements ModelRequestInterface {
    public title: string;

    @IsNotEmpty()
    public firstName: string;

    @IsNotEmpty()
    public lastName: string;

    @IsNotEmpty()
    public addressLine1: string;

    public addressLine2: string;

    @IsNotEmpty()
    public city: string;

    @IsDefined()
    public state: string;

    @IsNotEmpty()
    public country: string;

    @IsNotEmpty()
    public zipCode: string;

}
// tslint:enable:variable-name
