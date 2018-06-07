/**
 * BidDataValue
 *
 */

export enum BidDataValue {

    OUTPUTS = 'outputs',

    BUYER_PUBKEY = 'buyerPubkey',
    BUYER_OUTPUTS = 'buyerOutputs',
    BUYER_CHANGE_ADDRESS = 'buyerChangeAddress',
    BUYER_CHANGE_AMOUNT = 'buyerChange',
    BUYER_RELEASE_ADDRESS = 'buyerAddress',

    SELLER_PUBKEY = 'sellerPubkey',
    SELLER_OUTPUTS = 'sellerOutputs',

    RAW_TX = 'rawtx',
    ORDER_HASH = 'orderHash',
    TX_HASH = 'txHash',

    SHIPPING_ADDRESS_FIRST_NAME = 'ship.firstName',
    SHIPPING_ADDRESS_LAST_NAME = 'ship.lastName',
    SHIPPING_ADDRESS_ADDRESS_LINE1 = 'ship.addressLine1',
    SHIPPING_ADDRESS_ADDRESS_LINE2 = 'ship.addressLine2',
    SHIPPING_ADDRESS_CITY = 'ship.city',
    SHIPPING_ADDRESS_STATE= 'ship.state',
    SHIPPING_ADDRESS_ZIP_CODE = 'ship.zipCode',
    SHIPPING_ADDRESS_COUNTRY = 'ship.country'
}
