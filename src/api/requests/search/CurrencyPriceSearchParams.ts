// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsNotEmpty } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';

export class CurrencyPriceSearchParams extends RequestBody {

    @IsNotEmpty()
    public from: string;

    @IsNotEmpty()
    public to: string;
}
