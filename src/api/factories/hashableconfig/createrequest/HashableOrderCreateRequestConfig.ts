// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableCommonField } from 'omp-lib/dist/interfaces/omp-enums';
import { HashableOrderField } from '../HashableField';

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
