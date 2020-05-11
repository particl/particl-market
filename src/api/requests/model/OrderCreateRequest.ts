// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { OrderItemCreateRequest } from './OrderItemCreateRequest';
import { OrderStatus } from '../../enums/OrderStatus';
import { ModelRequestInterface } from './ModelRequestInterface';
import {AddressCreateRequest} from './AddressCreateRequest';

// tslint:disable:variable-name
export class OrderCreateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public address_id: number;
    // public address: AddressCreateRequest;

    @IsNotEmpty()
    public hash: string;

    @IsEnum(OrderStatus)
    @IsNotEmpty()
    public status: OrderStatus;

    public orderItems: OrderItemCreateRequest[];

    @IsNotEmpty()
    public buyer: string;

    @IsNotEmpty()
    public seller: string;

    @IsNotEmpty()
    public generatedAt: number;

}
// tslint:enable:variable-name
