// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableProposalOptionField } from '../HashableField';

export class HashableProposalOptionMessageConfig extends BaseHashableConfig {

    public fields = [{
        from: 'optionId',
        to: HashableProposalOptionField.PROPOSALOPTION_OPTION_ID
    }, {
        from: 'description',
        to: HashableProposalOptionField.PROPOSALOPTION_DESCRIPTION
    }] as HashableFieldConfig[];

    // pass the PROPOSAL_HASH as an extra field
    constructor(values: HashableFieldValueConfig[]) {
        super(values);
    }
}
