// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageInterface } from '../messages/ActionMessageInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import { ProposalMessageInterface } from '../messages/ProposalMessageInterface';
import { VoteMessageInterface } from '../messages/VoteMessageInterface';
import * as resources from 'resources';
import { IncomingSmsgMessage } from '../messages/IncomingSmsgMessage';

export interface MessageProcessorInterface {
    process( message: ActionMessageInterface | ListingItemMessageInterface | ProposalMessageInterface
        | VoteMessageInterface | IncomingSmsgMessage[] | resources.SmsgMessage[],
             marketAddress: string): any;
}
