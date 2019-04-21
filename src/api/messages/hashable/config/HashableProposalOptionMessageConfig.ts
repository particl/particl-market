// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';

export enum HashableProposalOptionField {
    PROPOSALOPTION_OPTION_ID = 'proposalOptionId',
    PROPOSALOPTION_DESCRIPTION = 'proposalOptionDescription'
}

export class HashableProposalOptionMessageConfig extends BaseHashableConfig {

    public fields = [{
        from: 'optionId',
        to: HashableProposalOptionField.PROPOSALOPTION_OPTION_ID
    }, {
        from: 'description',
        to: HashableProposalOptionField.PROPOSALOPTION_DESCRIPTION
    }] as HashableFieldConfig[];

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
