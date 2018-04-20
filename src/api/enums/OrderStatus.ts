/**
 * OrderStatus
 *
 */

export enum OrderStatus {

    AWAITING_ESCROW = 'AWAITING_ESCROW',    // seller has accepted buyers bid, waiting for buyer payment
    ESCROW_LOCKED = 'ESCROW_LOCKED',        // buyer has paid, waiting for seller to ship
    SHIPPING = 'SHIPPING',                  // seller has shipped, waiting for buyer to receive
    COMPLETE = 'COMPLETE'                   // order completed

}
