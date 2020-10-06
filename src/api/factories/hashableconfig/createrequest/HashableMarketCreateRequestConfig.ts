// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableMarketCRField, HashableMarketField } from '../HashableField';
import { HashableCommonField } from 'omp-lib/dist/interfaces/omp-enums';

export class HashableMarketCreateRequestConfig extends BaseHashableConfig {

    public fields = [/*{
        from: HashableMarketCRField.GENERATED_AT,
        to: HashableCommonField.GENERATED
    }, */{
        from: HashableMarketField.MARKET_NAME,
        to: HashableMarketField.MARKET_NAME
    }, {
        from: HashableMarketField.MARKET_DESCRIPTION,
        to: HashableMarketField.MARKET_DESCRIPTION
    },
/*
    {
        from: HashableMarketField.MARKET_TYPE,
        to: HashableMarketField.MARKET_TYPE
    },
 */
    // TODO: use address
    {
        from: HashableMarketField.MARKET_RECEIVE_ADDRESS,
        to: HashableMarketField.MARKET_RECEIVE_ADDRESS
    }, {
        from: HashableMarketField.MARKET_PUBLISH_ADDRESS,
        to: HashableMarketField.MARKET_PUBLISH_ADDRESS
    }
/*
    TODO: fix
    , {
        from: HashableMarketCRField.MARKET_IMAGE_HASH,
        to: HashableMarketField.MARKET_IMAGE_HASH
    }
*/
    ] as HashableFieldConfig[];

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
