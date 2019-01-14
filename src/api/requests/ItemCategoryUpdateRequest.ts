// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ItemCategoryUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public parent_item_category_id: number;

    public id: number;
    public key: string;

    @IsNotEmpty()
    public name: string;

    public description: string;

}
// tslint:enable:variable-name
