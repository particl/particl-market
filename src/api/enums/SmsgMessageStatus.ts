// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * SmsgMessageStatus
 *
 */

export enum SmsgMessageStatus {

    SENT = 'SENT',                              // used for the Outgoing SmsgMessage
    RESENT = 'RESENT',                          // used for the Outgoing SmsgMessage

    NEW = 'NEW',                                // new
    PARSING_FAILED = 'PARSING_FAILED',          // smsg parsing failed
    PROCESSING = 'PROCESSING',                  // currently being processed
    PROCESSED = 'PROCESSED',                    // processing done
    PROCESSING_FAILED = 'PROCESSING_FAILED',    // processing failed, can't recover
    VALIDATION_FAILED = 'VALIDATION_FAILED',    // message validation failed, can't recover
    WAITING = 'WAITING',                        // these are waiting for some other messages
    IGNORED = 'IGNORED',                        // ignored for some reason, perhaps for expiration...
    DB_LOCKED = 'DB_LOCKED'                     // db was locked, retry asap TODO: get rid of this
}
