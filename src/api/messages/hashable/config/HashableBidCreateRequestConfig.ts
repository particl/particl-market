import { HashableConfig, HashableFieldConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableBidField, HashableCommonField } from 'omp-lib/dist/interfaces/omp-enums';

export class HashableBidCreateRequestConfig implements HashableConfig {
    public fields = [{
        from: 'generatedAt',
        to: HashableCommonField.GENERATED
    }, {
        from: 'item',
        to: HashableBidField.ITEM_HASH
    }, {
        from: 'buyer.shippingAddress.firstName',
        to: HashableBidField.BUYER_SHIPPING_FIRSTNAME
    }, {
        from: 'buyer.shippingAddress.lastName',
        to: HashableBidField.BUYER_SHIPPING_LASTNAME
    }, {
        from: 'buyer.shippingAddress.addressLine1',
        to: HashableBidField.BUYER_SHIPPING_ADDRESS
    }, {
        from: 'buyer.shippingAddress.city',
        to: HashableBidField.BUYER_SHIPPING_CITY
    }, {
        from: 'buyer.shippingAddress.zipCode',
        to: HashableBidField.BUYER_SHIPPING_ZIP
    }, {
        from: 'buyer.shippingAddress.country',
        to: HashableBidField.BUYER_SHIPPING_COUNTRY
    }, {
        from: 'buyer.payment.escrow',
        to: HashableBidField.PAYMENT_ESCROW_TYPE
    }, {
        from: 'buyer.payment.cryptocurrency',
        to: HashableBidField.PAYMENT_CRYPTO
    }] as HashableFieldConfig[];
}
