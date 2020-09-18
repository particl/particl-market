// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { OrderItemSearchOrderField } from '../../enums/SearchOrderField';
import { BaseSearchParams } from './BaseSearchParams';

// tslint:disable:variable-name
export class OrderItemSearchParams extends BaseSearchParams {

    public orderField = OrderItemSearchOrderField.UPDATED_AT;

    public listingItemId: number;
    public status: OrderItemStatus;
    public buyerAddress: string;
    public sellerAddress: string;
    public market: string;

}
// tslint:enable:variable-name
