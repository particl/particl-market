// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { OrderItemStatus } from '../enums/OrderItemStatus';
import { SearchOrder } from '../enums/SearchOrder';

// tslint:disable:variable-name
export class OrderSearchParams extends RequestBody {
    // @IsNotEmpty()
    public listingItemId: number;
    public listingItemHash: string; // if hash is given, the service will fetch the id

    // TODO: add validation back
    // @ValidateIf(o => o.action)
    // @IsEnum(OrderItemStatus)
    public status: OrderItemStatus;

    public buyerAddress: string;
    public sellerAddress: string;

    // TODO: add validation back
    // @ValidateIf(o => o.action)
    // @IsEnum(SearchOrder)
    public ordering: SearchOrder;
}
// tslint:enable:variable-name
