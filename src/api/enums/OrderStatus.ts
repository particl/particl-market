// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * OrderStatus
 *
 * The current status of the Order.
 */

export enum OrderStatus {

    CREATED = 'CREATED',        // order created @buyer, not used yet
    SENT = 'SENT',              // order sent to seller @buyer
    RECEIVED = 'RECEIVED',      // order received and created @seller

    PROCESSING = 'PROCESSING',
    SHIPPING = 'SHIPPING',
    COMPLETE = 'COMPLETE',
    REFUNDED = 'REFUNDED',
    CANCELED = 'CANCELED',
    REJECTED = 'REJECTED'

}
