// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class OrderItemObjectCreateRequest extends RequestBody {

    @IsNotEmpty()
    public order_item_id: number;

    @IsNotEmpty()
    public key: string;

    // @IsNotEmpty()
    public value: string;

}
// tslint:enable:variable-name
