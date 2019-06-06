// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableCommonField } from 'omp-lib/dist/interfaces/omp-enums';
import { HashableBidReleaseField } from '../HashableField';

/**
 * used for MPA_COMPLETE, MPA_RELEASE and MPA_REFUND, MPA_SHIP
 */
export class HashableBidMessageConfig extends BaseHashableConfig {

    public fields = [{
        from: 'generated',
        to: HashableCommonField.GENERATED
    }, {
        from: 'bid',
        to: HashableBidReleaseField.BID_HASH
    }] as HashableFieldConfig[];

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
