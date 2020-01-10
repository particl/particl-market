// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { BaseSearchParams } from './BaseSearchParams';
import { BidSearchOrderField } from '../../enums/SearchOrderField';

// tslint:disable:variable-name
export class BidSearchParams extends BaseSearchParams {

    public orderField = BidSearchOrderField.UPDATED_AT;

    public listingItemId: number;
    public type: MPAction | OrderItemStatus;
    public searchString: string;
    public market: string;
    public bidders: string[];

}
// tslint:enable:variable-name
