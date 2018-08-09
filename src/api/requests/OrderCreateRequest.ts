// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemCreateRequest } from './OrderItemCreateRequest';
import {AddressCreateRequest} from './AddressCreateRequest';

// tslint:disable:variable-name
export class OrderCreateRequest extends RequestBody {

    @IsNotEmpty()
    public address: AddressCreateRequest;
    public address_id: number;

    @IsNotEmpty()
    public hash: string;

    public orderItems: OrderItemCreateRequest[];

    @IsNotEmpty()
    public buyer: string;

    @IsNotEmpty()
    public seller: string;

}
// tslint:enable:variable-name
