// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { IsEnum, IsNotEmpty, ValidateIf } from 'class-validator';
import { RequestBody } from '../../core/api/RequestBody';
import { SearchOrder } from '../enums/SearchOrder';
import * as _ from 'lodash';
import { ProposalType } from '../enums/ProposalType';
import {SmsgMessageStatus} from '../enums/SmsgMessageStatus';
import {EscrowMessageType} from '../enums/EscrowMessageType';
import {BidMessageType} from '../enums/BidMessageType';
import {VoteMessageType} from '../enums/VoteMessageType';
import {ListingItemMessageType} from '../enums/ListingItemMessageType';
import {ProposalMessageType} from '../enums/ProposalMessageType';

// tslint:disable:variable-name
export class SmsgMessageSearchParams extends RequestBody {

    @IsEnum(SearchOrder)
    public order: SearchOrder = SearchOrder.ASC;

    @IsEnum(SmsgMessageStatus)
    public status: SmsgMessageStatus;

    public type: EscrowMessageType | BidMessageType | ListingItemMessageType | ProposalMessageType | VoteMessageType | string;

}
// tslint:enable:variable-name
