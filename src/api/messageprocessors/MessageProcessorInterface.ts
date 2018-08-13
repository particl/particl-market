// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { ProposalMessageInterface } from '../messages/ProposalMessageInterface';
import { SmsgMessage } from '../messages/SmsgMessage';
import { VoteMessageInterface } from '../messages/VoteMessageInterface';

export interface MessageProcessorInterface {
    process( message: ActionMessageInterface | ListingItemMessageInterface | ProposalMessageInterface | VoteMessageInterface | SmsgMessage[],
             marketAddress: string): any;
}
