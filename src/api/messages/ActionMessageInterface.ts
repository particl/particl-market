// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';

type AllowedMessageTypes = EscrowMessageType | BidMessageType | ListingItemMessageType | ProposalMessageType | VoteMessageType;

export interface ActionMessageInterface {
    action: AllowedMessageTypes;
    item: string;
    objects?: any;
}
