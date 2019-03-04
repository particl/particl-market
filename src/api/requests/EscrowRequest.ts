// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

// tslint:disable:variable-name
export class EscrowRequest extends RequestBody {

    @IsNotEmpty()
    public orderItem: resources.OrderItem;

    public nonce?: string;      // lock param
    public accepted?: boolean;  // refund param

    @IsNotEmpty()
    public memo: string;

    @IsEnum(MPAction)
    @IsNotEmpty()
    public action: MPAction;
}
// tslint:enable:variable-name
