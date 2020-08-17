// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableMarketAddField, HashableMarketField } from '../HashableField';
import { HashableCommonField } from 'omp-lib/dist/interfaces/omp-enums';

export class HashableMarketAddMessageConfig extends BaseHashableConfig {

    public fields = [{
        from: HashableCommonField.GENERATED,
        to: HashableCommonField.GENERATED
    }, {
        from: HashableMarketField.MARKET_NAME,
        to: HashableMarketField.MARKET_NAME
    }, {
        from: HashableMarketField.MARKET_DESCRIPTION,
        to: HashableMarketField.MARKET_DESCRIPTION
    }, {
        from: HashableMarketAddField.MARKET_TYPE,       // marketType -> type
        to: HashableMarketField.MARKET_TYPE
    }, {
        from: HashableMarketField.MARKET_RECEIVE_KEY,
        to: HashableMarketField.MARKET_RECEIVE_KEY
    }, {
        from: HashableMarketField.MARKET_PUBLISH_KEY,
        to: HashableMarketField.MARKET_PUBLISH_KEY
    }, {
        from: HashableMarketAddField.MARKET_IMAGE_HASH,
        to: HashableMarketField.MARKET_IMAGE_HASH
    }] as HashableFieldConfig[];

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
