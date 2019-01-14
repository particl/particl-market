// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import {OrderItemUpdateRequest} from './OrderItemUpdateRequest';

// tslint:disable:variable-name
export class OrderUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public address_id: number;

    @IsNotEmpty()
    public hash: string;

    public orderItems: OrderItemUpdateRequest[];

    @IsNotEmpty()
    public buyer: string;

    @IsNotEmpty()
    public seller: string;

}
// tslint:enable:variable-name
