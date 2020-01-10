// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { OrderItemStatus } from '../../enums/OrderItemStatus';
import { OrderSearchOrderField } from '../../enums/SearchOrderField';
import { BaseSearchParams } from './BaseSearchParams';

// tslint:disable:variable-name
export class OrderSearchParams extends BaseSearchParams {

    public orderField = OrderSearchOrderField.UPDATED_AT;

    public listingItemId: number;
    public status: OrderItemStatus;
    public buyerAddress: string;
    public sellerAddress: string;

}
// tslint:enable:variable-name
