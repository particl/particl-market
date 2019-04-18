// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableBidField, HashableCommonField, HashableItemField } from 'omp-lib/dist/interfaces/omp-enums';

export declare enum HashableOrderField {
    ORDER_BUYER = 'orderBuyer',
    ORDER_SELLER = 'orderSeller'
}

// TODO: fix this overwrite!!!
// export type HashableFieldTypesMarketplace = HashableCommonField | HashableItemField | HashableBidField | HashableOrderField;
// interface HashableFieldConfigExtension {
//    to: HashableFieldTypesMarketplace;
// }
// interface HashableFieldConfigExtended extends Overwrite<HashableFieldConfig, HashableFieldConfigExtension> {}

export class HashableOrderCreateRequestConfig extends BaseHashableConfig {

    public fields = [{
        from: 'generatedAt',
        to: HashableCommonField.GENERATED
    }, {
        from: 'buyer',
        to: HashableOrderField.ORDER_BUYER
    }, {
        from: 'seller',
        to: HashableOrderField.ORDER_SELLER
    }] as HashableFieldConfig[];

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
