import * as _ from 'lodash';

export interface GenerateBidParamsInterface {
    generateListingItem: boolean;
    toParamsArray(): boolean[];
}

export class GenerateBidParams implements GenerateBidParamsInterface {

    // GenerateBidParamsInterface
    public generateListingItem = true;

    /**
     * generateParams[]:
     * [0]: generateListingItem
     *
     * @param generateParams
     */
    constructor(generateParams: boolean[] = []) {
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateListingItem          = generateParams[0] ? true : false;
        }
    }

    public toParamsArray(): boolean[] {
        return [this.generateListingItem];
    }

}
