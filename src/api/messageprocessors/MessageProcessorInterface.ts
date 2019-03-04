// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { ActionMessageItemInterface } from '../messages/ActionMessageItemInterface';
import { ListingItemMessageInterface } from '../messages/ListingItemMessageInterface';
import * as resources from 'resources';
import { IncomingSmsgMessage } from '../messages/IncomingSmsgMessage';
import {ActionMessageInterface} from '../messages/ActionMessageInterface';

type AllowedMessageTypes = ActionMessageInterface | ActionMessageItemInterface | ListingItemMessageInterface | IncomingSmsgMessage[] | resources.SmsgMessage[];

export interface MessageProcessorInterface {
    process( message: AllowedMessageTypes, emitEvent: boolean): any;
}
