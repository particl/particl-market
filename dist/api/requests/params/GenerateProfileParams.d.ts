export interface GenerateProfileParamsInterface {
    generateShippingAddresses: boolean;
    generateCryptocurrencyAddresses: boolean;
    toParamsArray(): boolean[];
}
export declare class GenerateProfileParams implements GenerateProfileParamsInterface {
    generateShippingAddresses: boolean;
    generateCryptocurrencyAddresses: boolean;
    /**
     * generateParams[]:
     * [0]: generateShippingAddresses
     * [1]: generateCryptocurrencyAddresses
     *
     * @param generateParams
     */
    constructor(generateParams?: boolean[]);
    toParamsArray(): boolean[];
}
