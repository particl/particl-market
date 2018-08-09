// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import * as resources from 'resources';

// tslint:disable:variable-name
export class EscrowRequest extends RequestBody {

    @IsNotEmpty()
    public orderItem: resources.OrderItem;

    public nonce?: string;      // lock param
    public accepted?: boolean;  // refund param

    @IsNotEmpty()
    public memo: string;

    @IsEnum(EscrowMessageType)
    @IsNotEmpty()
    public action: EscrowMessageType;

}
// tslint:enable:variable-name
