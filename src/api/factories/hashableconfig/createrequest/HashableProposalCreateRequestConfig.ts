// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BaseHashableConfig, HashableFieldConfig, HashableFieldValueConfig } from 'omp-lib/dist/interfaces/configs';
import { HashableProposalAddField } from '../HashableField';

export class HashableProposalCreateRequestConfig extends BaseHashableConfig {

    public fields = [{
        from: 'submitter',
        to: HashableProposalAddField.PROPOSAL_SUBMITTER
    }, {
        from: 'category',
        to: HashableProposalAddField.PROPOSAL_CATEGORY
    }, {
        from: 'title',
        to: HashableProposalAddField.PROPOSAL_TITLE
    }, {
        from: 'description',
        to: HashableProposalAddField.PROPOSAL_DESCRIPTION
    }, {
        from: 'item',
        to: HashableProposalAddField.PROPOSAL_ITEM
    }] as HashableFieldConfig[];

    constructor(values?: HashableFieldValueConfig[]) {
        super(values);
    }
}
