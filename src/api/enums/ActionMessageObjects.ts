// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

export enum ActionMessageObjects {

    RESENT_MSGID = 'resent.msgid',

    SHIPPING_MEMO = 'shipping.memo',    // MPA_SHIP
    ORDER_HASH = 'order.hash',          // MPA_BID
    TXID_LOCK = 'txid.lock',            // MPA_LOCK
    TXID_RELEASE = 'txid.release',      // MPA_RELEASE
    TXID_REFUND = 'txid.refund',        // MPA_REFUND
    TXID_COMPLETE = 'txid.complete',    // MPA_COMPLETE
    BID_REJECT_REASON = 'reject.reason' // MPA_REJECT
}
