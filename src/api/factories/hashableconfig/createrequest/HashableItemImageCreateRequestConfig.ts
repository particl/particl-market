// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableItemImageField } from '../HashableField';


export class HashableItemImageCreateRequestConfig extends BaseHashableConfig {

    public fields = [{
        from: 'data',
        to: HashableItemImageField.IMAGE_DATA
    }] as HashableFieldConfig[];

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
