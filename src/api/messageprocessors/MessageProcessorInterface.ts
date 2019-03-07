// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
import { ProcessableMessages } from '../enums/ProcessableMessages';

/**
 * This is the interface for MessageProcessors, which there was supposed to be several and perhaps there is after the next refactoring round...
 */
export interface MessageProcessorInterface {
    process( message: ProcessableMessages, emitEvent: boolean): any;
}
