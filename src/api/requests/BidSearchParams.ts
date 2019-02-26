// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ValidateIf, IsEnum, IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { BidMessageType } from '../enums/BidMessageType';
import { SearchOrder } from '../enums/SearchOrder';
import { OrderStatus } from '../enums/OrderStatus';

// tslint:disable:variable-name
export class BidSearchParams extends RequestBody {

    // @IsNotEmpty()
    public listingItemId: number;
    public listingItemHash: string; // if hash is given, the service will fetch the id
    public ordering: SearchOrder;

    // order status filtering
    public status: BidMessageType | OrderStatus;

    // searchBy by string
    public searchString: string;

    // pagination
    public page: number;
    public pageLimit: number;

    public bidders: string[];

}
// tslint:enable:variable-name
