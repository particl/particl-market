// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { RequestBody } from '../../../core/api/RequestBody';
import { SearchOrder } from '../../enums/SearchOrder';
import { SearchOrderField } from '../../enums/SearchOrderField';

export class BaseSearchParams extends RequestBody {
    public page: number;
    public pageLimit: number;
    public order: SearchOrder;
    public orderField: SearchOrderField;
}
