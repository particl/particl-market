// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * BidDataValue
 *
 */
export enum BidDataValue {

    // TODO: move to ActionMessageObjects

    SHIPPING_ADDRESS_FIRST_NAME = 'shippingAddress.firstName',
    SHIPPING_ADDRESS_LAST_NAME = 'shippingAddress.lastName',
    SHIPPING_ADDRESS_ADDRESS_LINE1 = 'shippingAddress.addressLine1',
    SHIPPING_ADDRESS_ADDRESS_LINE2 = 'shippingAddress.addressLine2',
    SHIPPING_ADDRESS_CITY = 'shippingAddress.city',
    SHIPPING_ADDRESS_STATE = 'shippingAddress.state',
    SHIPPING_ADDRESS_ZIP_CODE = 'shippingAddress.zipCode',
    SHIPPING_ADDRESS_COUNTRY = 'shippingAddress.country',

    DELIVERY_CONTACT_PHONE = 'delivery.phone',
    DELIVERY_CONTACT_EMAIL = 'delivery.email'

}
