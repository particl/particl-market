// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { RequestBody } from '../../../core/api/RequestBody';

export class ItemCategorySearchParams extends RequestBody {

    public market: string;
    public key: string;
    public name: string;
    public parentId: number;

    public isRoot: boolean;
    public isDefault: boolean;

}
