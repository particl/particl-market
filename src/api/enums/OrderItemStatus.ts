// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * OrderItemStatus
 *
 * The current status of the OrderItem
 */

export enum OrderItemStatus {

    BIDDED = 'BIDDED',                      // buyer has bidded for the item, waiting for seller accept
    BID_CANCELLED = 'BID_CANCELLED',        // buyer cancelled the bid before seller accepted or rejected
    BID_REJECTED = 'BID_REJECTED',          // seller rejected the buyers bid for the item
    AWAITING_ESCROW = 'AWAITING_ESCROW',    // seller has accepted buyers bid, waiting for buyer payment
    ESCROW_LOCKED = 'ESCROW_LOCKED',        // buyer has paid, waiting for seller to ship
    ESCROW_COMPLETED = 'ESCROW_COMPLETED',  // seller posted completetx
    ESCROW_REFUNDED = 'ESCROW_REFUNDED',
    SHIPPING = 'SHIPPING',                  // seller has shipped, waiting for buyer to receive
    COMPLETE = 'COMPLETE'                   // order completed

}
