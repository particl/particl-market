import { HashableConfig, HashableFieldConfig } from 'omp-lib/dist/interfaces/configs';
import {HashableCommonField, HashableItemField} from 'omp-lib/dist/interfaces/omp-enums';

export class HashableListingItemTemplateCreateRequestConfig implements HashableConfig {
    public fields = [{
        from: 'generatedAt',
        to: HashableCommonField.GENERATED
    }, {
        from: 'itemInformation.title',
        to: HashableItemField.TITLE
    }, {
        from: 'itemInformation.shortDescription',
        to: HashableItemField.SHORT_DESC
    }, {
        from: 'itemInformation.longDescription',
        to: HashableItemField.LONG_DESC
    }, {
        from: 'paymentInformation.payment.type',
        to: HashableItemField.SALE_TYPE
    }, {
        from: 'paymentInformation.escrow.type',
        to: HashableItemField.ESCROW_TYPE
    }, {
        from: 'paymentInformation.escrow.ratio.buyer',
        to: HashableItemField.ESCROW_RATIO_BUYER
    }, {
        from: 'paymentInformation.escrow.ratio.seller',
        to: HashableItemField.ESCROW_RATIO_SELLER
    }, {
        from: 'paymentInformation.itemPrice.currency',
        to: HashableItemField.PAYMENT_CURRENCY
    }, {
        from: 'paymentInformation.itemPrice.basePrice',
        to: HashableItemField.PAYMENT_BASE_PRICE
    }, {
        from: 'paymentInformation.itemPrice.cryptocurrencyAddress.type',
        to: HashableItemField.PAYMENT_ADDRESS_TYPE
    }, {
        from: 'paymentInformation.itemPrice.cryptocurrencyAddress.address',
        to: HashableItemField.PAYMENT_ADDRESS_ADDRESS
    }, {
        from: 'paymentInformation.itemPrice.shippingPrice.domestic',
        to: HashableItemField.PAYMENT_SHIPPING_PRICE_DOMESTIC
    }, {
        from: 'paymentInformation.itemPrice.shippingPrice.international',
        to: HashableItemField.PAYMENT_SHIPPING_PRICE_INTL
    }] as HashableFieldConfig[];
}
