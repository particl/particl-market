// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import {IsEnum, IsNotEmpty} from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemObjectUpdateRequest } from './OrderItemObjectUpdateRequest';
import {OrderStatus} from '../enums/OrderStatus';

// tslint:disable:variable-name
export class OrderItemUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public itemHash: string;

    @IsEnum(OrderStatus)
    @IsNotEmpty()
    public status: OrderStatus;

    public orderItemObjects: OrderItemObjectUpdateRequest[];

}
// tslint:enable:variable-name
