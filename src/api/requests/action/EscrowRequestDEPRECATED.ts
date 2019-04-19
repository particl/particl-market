// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { IsNotEmpty, IsEnum } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import {MPActionExtended} from '../../enums/MPActionExtended';

export class EscrowRequestDEPRECATED extends RequestBody {

    @IsEnum(MPAction)
    @IsNotEmpty()
    public type: MPAction;

    @IsNotEmpty()
    public orderItem: resources.OrderItem;

    // TODO: deprecated?
    public nonce?: string;      // lock param
    public accepted?: boolean;  // refund param
    public memo?: string;

}
