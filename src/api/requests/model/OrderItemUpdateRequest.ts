// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { ModelRequestInterface } from './ModelRequestInterface';

// tslint:disable:variable-name
export class OrderItemUpdateRequest extends RequestBody implements ModelRequestInterface {

    @IsNotEmpty()
    public itemHash: string;

    @IsEnum(OrderItemStatus)
    @IsNotEmpty()
    public status: OrderItemStatus;

}
// tslint:enable:variable-name
