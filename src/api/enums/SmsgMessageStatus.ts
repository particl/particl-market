// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * SmsgMessageStatus
 *
 */

export enum SmsgMessageStatus {

    NEW = 'NEW',                                // new
    PARSING_FAILED = 'PARSING_FAILED',          // smsg parsing failed
    PROCESSING = 'PROCESSING',                  // currently being processed
    PROCESSED = 'PROCESSED',                    // processing done
    PROCESSING_FAILED = 'PROCESSING_FAILED',    // processing failed, can't recover
    WAITING = 'WAITING',                        // these are waiting for some other messages
    DB_LOCKED = 'DB_LOCKED'                     // db was locked, retry asap TODO: get rid of this
}
