// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableCommonField, HashableItemField } from 'omp-lib/dist/interfaces/omp-enums';

export class HashableListingItemTemplateCreateRequestConfig extends BaseHashableConfig {
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
        from: 'paymentInformation.type',
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

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
