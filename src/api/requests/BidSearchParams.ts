// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';
import { OrderItemStatus } from '../enums/OrderItemStatus';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

// tslint:disable:variable-name
export class BidSearchParams extends RequestBody {

    // @IsNotEmpty()
    public listingItemId: number;
    public listingItemHash: string; // if hash is given, the service will fetch the id
    public ordering: SearchOrder;

    // order status filtering
    public status: MPAction | OrderItemStatus;

    // searchBy by string
    public searchString: string;

    // pagination
    public page: number;
    public pageLimit: number;

    public bidders: string[];

}
// tslint:enable:variable-name
