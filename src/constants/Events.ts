// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * constants.Events
 * ------------------------------------------------
 *
 * All the events the messageprocessors sends
 */

export const Events = {
    ListingItemReceivedEvent: 'ListingItemReceivedEvent',
    LockEscrowReceivedEvent: 'LockEscrowReceivedEvent',
    RefundEscrowReceivedEvent: 'RefundEscrowReceivedEvent',
    ReleaseEscrowReceivedEvent: 'ReleaseEscrowReceivedEvent',
    BidReceivedEvent: 'BidReceivedEvent',
    AcceptBidReceivedEvent: 'AcceptBidReceivedEvent',
    RejectBidReceivedEvent: 'RejectBidReceivedEvent',
    CancelBidReceivedEvent: 'CancelBidReceivedEvent',
    ProposalReceivedEvent: 'ProposalReceivedEvent',
    VoteReceivedEvent: 'VoteReceivedEvent',
    Cli: 'cli'
};
