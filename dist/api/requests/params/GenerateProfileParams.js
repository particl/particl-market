"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class GenerateProfileParams {
    /**
     * generateParams[]:
     * [0]: generateShippingAddresses
     * [1]: generateCryptocurrencyAddresses
     *
     * @param generateParams
     */
    constructor(generateParams = []) {
        // GenerateProfileParamsInterface
        this.generateShippingAddresses = true;
        this.generateCryptocurrencyAddresses = true;
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams)) {
            this.generateShippingAddresses = generateParams[0] ? true : false;
            this.generateCryptocurrencyAddresses = generateParams[1] ? true : false;
        }
    }
    toParamsArray() {
        return [this.generateShippingAddresses, this.generateCryptocurrencyAddresses];
    }
}
exports.GenerateProfileParams = GenerateProfileParams;
//# sourceMappingURL=GenerateProfileParams.js.map