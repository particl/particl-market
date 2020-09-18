// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';

export interface GenerateProposalParamsInterface {
    toParamsArray(): any[];
}

export class GenerateProposalParams implements GenerateProposalParamsInterface {

    public listingItemId: number;
    public generatePastProposal = false;
    public voteCount = 0;
    public submitter;
    public market;
    public generateOptions = true;
    public generateResults = true;

    /**
     * generateParams[]:
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {
        if (!_.isEmpty(generateParams) ) {
            this.listingItemId = generateParams[0] ? generateParams[0] : undefined;
            this.generatePastProposal = generateParams[1] ? generateParams[1] : false;
            this.voteCount = generateParams[2] ? generateParams[2] : 0;
            this.submitter = generateParams[3] ? generateParams[3] : undefined;
            this.market = generateParams[4] ? generateParams[4] : undefined;
            this.generateOptions = generateParams[5] ? generateParams[5] : false;
            this.generateResults = generateParams[6] ? generateParams[6] : false;

        }
    }

    public toParamsArray(): any[] {
        return [
            this.listingItemId,
            this.generatePastProposal,
            this.voteCount,
            this.submitter,
            this.market,
            this.generateOptions,
            this.generateResults
        ];
    }
}
