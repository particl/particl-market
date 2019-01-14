// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { ProposalMessageInterface } from '../messages/ProposalMessageInterface';
import { VoteMessageInterface } from '../messages/VoteMessageInterface';
import * as resources from 'resources';
import { IncomingSmsgMessage } from '../messages/IncomingSmsgMessage';
import { EscrowMessageType } from '../enums/EscrowMessageType';
import { BidMessageType } from '../enums/BidMessageType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ProposalMessageType } from '../enums/ProposalMessageType';
import { VoteMessageType } from '../enums/VoteMessageType';

type AllowedMessageTypes = ActionMessageInterface | ListingItemMessageInterface | ProposalMessageInterface
    | VoteMessageInterface | IncomingSmsgMessage[] | resources.SmsgMessage[];

export interface MessageProcessorInterface {
    process( message: AllowedMessageTypes, emitEvent: boolean): any;
}
