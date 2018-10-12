// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * BidDataValue
 *
 */

export enum BidDataValue {

    BUYER_PUBKEY = 'buyerPubkey',
    BUYER_OUTPUTS = 'buyerOutputs',
    BUYER_CHANGE_ADDRESS = 'buyerChangeAddress',
    BUYER_CHANGE_AMOUNT = 'buyerChange',
    BUYER_RELEASE_ADDRESS = 'buyerAddress',

    SELLER_PUBKEY = 'sellerPubkey',
    SELLER_OUTPUTS = 'sellerOutputs',

    RAW_TX = 'rawtx',
    ORDER_HASH = 'orderHash',

    SHIPPING_ADDRESS_FIRST_NAME = 'shippingAddress.firstName',
    SHIPPING_ADDRESS_LAST_NAME = 'shippingAddress.lastName',
    SHIPPING_ADDRESS_ADDRESS_LINE1 = 'shippingAddress.addressLine1',
    SHIPPING_ADDRESS_ADDRESS_LINE2 = 'shippingAddress.addressLine2',
    SHIPPING_ADDRESS_CITY = 'shippingAddress.city',
    SHIPPING_ADDRESS_STATE = 'shippingAddress.state',
    SHIPPING_ADDRESS_ZIP_CODE = 'shippingAddress.zipCode',
    SHIPPING_ADDRESS_COUNTRY = 'shippingAddress.country'
}
