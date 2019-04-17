// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { OrderItemUpdateRequest } from './OrderItemUpdateRequest';
import { OrderStatus } from '../../enums/OrderStatus';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class OrderUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public address_id: number;

    @IsNotEmpty()
    public hash: string;

    @IsEnum(OrderStatus)
    @IsNotEmpty()
    public status: OrderStatus;

    public orderItems: OrderItemUpdateRequest[];

    @IsNotEmpty()
    public buyer: string;

    @IsNotEmpty()
    public seller: string;

}
// tslint:enable:variable-name
