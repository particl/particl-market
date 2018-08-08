// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';

// tslint:disable:variable-name
export class ShoppingCartCreateRequest extends RequestBody {
    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public profile_id: number;
}
// tslint:enable:variable-name
