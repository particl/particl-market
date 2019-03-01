// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';
import { SmsgMessageStatus } from '../enums/SmsgMessageStatus';

// tslint:disable:variable-name
export class SmsgMessageSearchParams extends RequestBody {

    @IsEnum(SearchOrder)
    public order: SearchOrder = SearchOrder.DESC;
    public orderByColumn = 'received';

    @IsEnum(SmsgMessageStatus)
    public status: SmsgMessageStatus;

    // TODO: is there a reason, why is this any[]? FIX
    public types: any[]; // MPAction | ProposalMessageType | VoteMessageType | string;

    public page = 0;
    public pageLimit = 10;

    public age = 1000 * 60 * 2; // minimum message age in ms, 2 min

    public msgid;
}
// tslint:enable:variable-name
