// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { EscrowType } from '../enums/EscrowType';

// tslint:disable:variable-name
export class EscrowUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public payment_information_id: number;

    @IsEnum(EscrowType)
    @IsNotEmpty()
    public type: EscrowType;

    public ratio;

}
// tslint:enable:variable-name
