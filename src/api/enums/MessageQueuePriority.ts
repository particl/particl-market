// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * MessageQueuePriority
 *
 */

export enum MessageQueuePriority {

    SMSGMESSAGE = 100,

    // listing events
    MPA_LISTING_ADD = 90,

    // buy flow events
    MPA_BID = 80,
    MPA_ACCEPT = 75,
    MPA_REJECT = 75,
    MPA_CANCEL = 70,
    MPA_LOCK = 65,
    MPA_COMPLETE = 60,
    MPA_SHIP = 55,
    MPA_RELEASE = 50,
    MPA_REFUND = 45,

    // governance events
    MPA_PROPOSAL_ADD = 80,
    MPA_VOTE = 70,

    // comment events
    MPA_COMMENT_ADD = 70,

    // unknown events
    UNKNOWN = 10

}
