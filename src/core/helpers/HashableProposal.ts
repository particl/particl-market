// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

/**
 * core.api.HashableProposal
 *
 */
import { ProposalCreateRequest } from '../../api/requests/ProposalCreateRequest';

export class HashableProposal {

    public submitter: string;
    public category: string;
    public title: string;
    public description: string;
    public item: string;
    public options: string;

    constructor(hashThis: ProposalCreateRequest) {
        const input = JSON.parse(JSON.stringify(hashThis));

        if (input) {
            this.submitter = input.submitter;
            this.category = input.category;
            this.title = input.title;
            this.description = input.description;
            this.item = input.item;

            this.options = '';

            input.options = input.options || [];
            for (const option of input.options) {
                this.options = this.options + option.optionId + ':' + option.description + ':';
            }
        }
    }

}
