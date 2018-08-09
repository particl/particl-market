// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';
import { SearchOrder } from '../enums/SearchOrder';
import { OrderStatus } from '../enums/OrderStatus';

// tslint:disable:variable-name
export class BidSearchParams extends RequestBody {

    // TODO: add validation back
    // @ValidateIf(o => o.action)
    // @IsEnum(BidMessageType)
    public action: BidMessageType;

    // @IsNotEmpty()
    public listingItemId: number;
    public listingItemHash: string; // if hash is given, the service will fetch the id

    // TODO: add validation back
    // @ValidateIf(o => o.action)
    // @IsEnum(SearchOrder)
    public ordering: SearchOrder;

    // order status filtering
    public orderStatus: OrderStatus;

    // search by description and title
    public title: string;
    public shortDescription: string;
    public longDescription: string;
    // pagination
    public pageLimit: number;
    public page: number;

    public bidders: string[];

}
// tslint:enable:variable-name
