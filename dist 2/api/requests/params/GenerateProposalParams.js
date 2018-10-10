"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class GenerateProposalParams {
    /**
     * generateParams[]:
     *
     * @param generateParams
     */
    constructor(generateParams = []) {
        // Params. Initialised to default go here
        this.generateListingItemTemplate = true;
        this.generateListingItem = true;
        this.generatePastProposal = false;
        this.voteCount = 0;
        this.submitter = null;
        if (!_.isEmpty(generateParams)) {
            this.generateListingItemTemplate = generateParams[0] ? true : false;
            this.generateListingItem = generateParams[1] ? true : false;
            this.listingItemHash = generateParams[2] ? generateParams[2] : null;
            this.generatePastProposal = generateParams[3] ? generateParams[3] : false;
            this.voteCount = generateParams[4] ? generateParams[4] : 0;
            this.submitter = generateParams[5] ? generateParams[5] : null;
        }
    }
    toParamsArray() {
        return [
            this.generateListingItemTemplate,
            this.generateListingItem,
            this.listingItemHash,
            this.generatePastProposal,
            this.voteCount,
            this.submitter
        ];
    }
}
exports.GenerateProposalParams = GenerateProposalParams;
//# sourceMappingURL=GenerateProposalParams.js.map