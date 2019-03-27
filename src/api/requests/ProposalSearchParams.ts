// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';
import * as _ from 'lodash';
import { ProposalCategory } from '../enums/ProposalCategory';

// tslint:disable:variable-name
export class ProposalSearchParams extends RequestBody {

    @IsEnum(SearchOrder)
    public order: SearchOrder = SearchOrder.ASC;

    @IsEnum(ProposalCategory)
    public type: ProposalCategory;

    public timeStart: number | string;
    public timeEnd: number | string;
}
// tslint:enable:variable-name
