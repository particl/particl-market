// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageItemInterface } from '../messages/ActionMessageItemInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { ProposalMessageInterface } from '../messages/ProposalMessageInterface';
import { VoteMessageInterface } from '../messages/VoteMessageInterface';
import * as resources from 'resources';
import { IncomingSmsgMessage } from '../messages/IncomingSmsgMessage';

type AllowedMessageTypes = ActionMessageItemInterface | ListingItemMessageInterface | ProposalMessageInterface
    | VoteMessageInterface | IncomingSmsgMessage[] | resources.SmsgMessage[];

export interface MessageProcessorInterface {
    process( message: AllowedMessageTypes, emitEvent: boolean): any;
}
