import * as _ from 'lodash';

export interface GenerateProfileParamsInterface {
    generateShippingAddresses: boolean;
    generateCryptocurrencyAddresses: boolean;
    toParamsArray(): boolean[];
}

export class GenerateProfileParams implements GenerateProfileParamsInterface {

    // GenerateProfileParamsInterface
    public generateShippingAddresses = true;
    public generateCryptocurrencyAddresses = true;

    /**
     * generateParams[]:
     * [0]: generateShippingAddresses
     * [1]: generateCryptocurrencyAddresses
     *
     * @param generateParams
     */
    constructor(generateParams: boolean[] = []) {
        // set params only if there are some -> by default all are true
        if (!_.isEmpty() ) {
            this.generateShippingAddresses          = generateParams[0] ? true : false;
            this.generateCryptocurrencyAddresses    = generateParams[1] ? true : false;
        }
    }

    public toParamsArray(): boolean[] {
        return [this.generateShippingAddresses, this.generateCryptocurrencyAddresses];
    }

}
