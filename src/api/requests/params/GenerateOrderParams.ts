import * as _ from 'lodash';

export interface GenerateOrderParamsInterface {
    generateListingItem: boolean;
    toParamsArray(): boolean[];
}

export class GenerateOrderParams implements GenerateOrderParamsInterface {

    public generateListingItem = true;

    /**
     * generateParams[]:
     * [0]: generateListingItem
     *
     * @param generateParams
     */
    constructor(generateParams: boolean[] = []) {

        // TODO: this is stupid, bids cannot be generated without listingitem (and bid)

        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateListingItem = generateParams[0] ? true : false;
        }
    }

    public toParamsArray(): boolean[] {
        return [this.generateListingItem];
    }

}
