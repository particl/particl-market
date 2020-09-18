// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableBidField, HashableCommonField } from 'omp-lib/dist/interfaces/omp-enums';

export class HashableBidCreateRequestConfig extends BaseHashableConfig {

    public fields = [{
        from: 'generatedAt',
        to: HashableCommonField.GENERATED
// set using the HashableFieldValueConfig
//    }, {
//        from: 'item',
//        to: HashableBidField.ITEM_HASH
    }, {
        from: 'address.firstName',
        to: HashableBidField.BUYER_SHIPPING_FIRSTNAME
    }, {
        from: 'address.lastName',
        to: HashableBidField.BUYER_SHIPPING_LASTNAME
    }, {
        from: 'address.addressLine1',
        to: HashableBidField.BUYER_SHIPPING_ADDRESS
    }, {
        from: 'address.city',
        to: HashableBidField.BUYER_SHIPPING_CITY
    }, {
        from: 'address.zipCode',
        to: HashableBidField.BUYER_SHIPPING_ZIP
    }, {
        from: 'address.country',
        to: HashableBidField.BUYER_SHIPPING_COUNTRY
// set using the HashableFieldValueConfig
//    }, {
//        from: 'buyer.payment.escrow',
//        to: HashableBidField.PAYMENT_ESCROW_TYPE
// set using the HashableFieldValueConfig
//    }, {
//        from: 'buyer.payment.cryptocurrency',
//        to: HashableBidField.PAYMENT_CRYPTO
    }] as HashableFieldConfig[];

    constructor(values: HashableFieldValueConfig[]) {
        super(values);
    }
}
