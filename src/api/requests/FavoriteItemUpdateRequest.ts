// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class FavoriteItemUpdateRequest extends RequestBody {

    @IsNotEmpty()
    public profile_id: number;

    @IsNotEmpty()
    public listing_item_id: number;

}
// tslint:enable:variable-name

