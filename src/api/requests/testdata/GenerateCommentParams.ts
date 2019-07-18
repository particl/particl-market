// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';

export interface GenerateCommentParamsInterface {
    generateListingItem: boolean;
    toParamsArray(): boolean[];
}

export class GenerateCommentParams implements GenerateCommentParamsInterface {

    // Params. Initialised to default go here
    public generateListingItemTemplate = true;
    public generateListingItem = true;
    public generatePastComment = false;
    public type = null;
    public sender = null;
    public receiver = null;
    public target = null;

    /**
     * generateParams[]:
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {
        if (!_.isEmpty(generateParams) ) {
            this.generateListingItemTemplate = generateParams[0] ? true : false;
            this.generateListingItem = generateParams[1] ? true : false;
            this.generatePastComment = generateParams[2] ? generateParams[2] : false;
            this.sender = generateParams[3] ? generateParams[3] : null;
            this.receiver = generateParams[4] ? generateParams[4] : null;
            this.type = generateParams[5] ? generateParams[5] : null;
            this.target = generateParams[6] ? generateParams[6] : null;
        }
    }

    public toParamsArray(): any[] {
        return [
            this.generateListingItemTemplate,
            this.generateListingItem,
            this.generatePastComment,
            this.sender,
            this.receiver,
            this.type,
            this.target
        ];
    }
}
