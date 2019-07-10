// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import {BaseHashableConfig, HashableConfig, HashableFieldConfig, HashableFieldValueConfig} from 'omp-lib/dist/interfaces/configs';
import {HashableCommonField, HashableItemField} from 'omp-lib/dist/interfaces/omp-enums';

export class HashableListingItemTemplateConfig extends BaseHashableConfig {
    public fields = [{
        from: 'generatedAt',
        to: HashableCommonField.GENERATED
    }, {
        from: 'ItemInformation.title',
        to: HashableItemField.TITLE
    }, {
        from: 'ItemInformation.shortDescription',
        to: HashableItemField.SHORT_DESC
    }, {
        from: 'ItemInformation.longDescription',
        to: HashableItemField.LONG_DESC
    }, {
        from: 'PaymentInformation.type',
        to: HashableItemField.SALE_TYPE
    }, {
        from: 'PaymentInformation.Escrow.type',
        to: HashableItemField.ESCROW_TYPE
    }, {
        from: 'PaymentInformation.Escrow.Ratio.buyer',
        to: HashableItemField.ESCROW_RATIO_BUYER
    }, {
        from: 'PaymentInformation.Escrow.Ratio.seller',
        to: HashableItemField.ESCROW_RATIO_SELLER
    }, {
        from: 'PaymentInformation.ItemPrice.currency',
        to: HashableItemField.PAYMENT_CURRENCY
    }, {
        from: 'PaymentInformation.ItemPrice.basePrice',
        to: HashableItemField.PAYMENT_BASE_PRICE
    }, {
        from: 'PaymentInformation.ItemPrice.CryptocurrencyAddress.type',
        to: HashableItemField.PAYMENT_ADDRESS_TYPE
    }, {
        from: 'PaymentInformation.ItemPrice.CryptocurrencyAddress.address',
        to: HashableItemField.PAYMENT_ADDRESS_ADDRESS
    }, {
        from: 'PaymentInformation.ItemPrice.ShippingPrice.domestic',
        to: HashableItemField.PAYMENT_SHIPPING_PRICE_DOMESTIC
    }, {
        from: 'PaymentInformation.ItemPrice.ShippingPrice.international',
        to: HashableItemField.PAYMENT_SHIPPING_PRICE_INTL
    }] as HashableFieldConfig[];

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
