// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { RequestBody } from '../../../core/api/RequestBody';
import { SearchOrder } from '../../enums/SearchOrder';
import { BlacklistType } from '../../enums/BlacklistType';


// tslint:disable:variable-name
export class BlacklistSearchParams extends RequestBody {

    @IsEnum(SearchOrder)
    public order: SearchOrder = SearchOrder.ASC;

    @IsEnum(BlacklistType)
    public type: BlacklistType;
    public target: string;
    public market: string;

    public profileId: number;
    public listingItemId: number;

}
// tslint:enable:variable-name
