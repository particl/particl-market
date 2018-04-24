export interface GenerateListingItemTemplateParamsInterface {
    generateItemInformation: boolean;
    generatePaymentInformation: boolean;
    generateMessagingInformation: boolean;
    generateListingItemObjects: boolean;
    toParamsArray(): boolean[];
}
export interface GenerateItemInformationParamsInterface {
    generateShippingDestinations: boolean;
    generateItemImages: boolean;
}
export interface GeneratePaymentInformationParamsInterface {
    generateEscrow: boolean;
    generateItemPrice: boolean;
}
export interface GenerateListingItemObjectParamsInterface {
    generateObjectDatas: boolean;
}
export declare class GenerateListingItemTemplateParams implements GenerateListingItemTemplateParamsInterface, GenerateItemInformationParamsInterface, GeneratePaymentInformationParamsInterface, GenerateListingItemObjectParamsInterface {
    generateItemInformation: boolean;
    generateShippingDestinations: boolean;
    generateItemImages: boolean;
    generatePaymentInformation: boolean;
    generateEscrow: boolean;
    generateItemPrice: boolean;
    generateMessagingInformation: boolean;
    generateListingItemObjects: boolean;
    generateObjectDatas: boolean;
    profileId: number | null;
    generateListingItem: boolean;
    marketId: number | null;
    /**
     * generateParams[]:
     * [0]: generateItemInformation
     * [1]: generateShippingDestinations
     * [2]: generateItemImages
     * [3]: generatePaymentInformation
     * [4]: generateEscrow
     * [5]: generateItemPrice
     * [6]: generateMessagingInformation
     * [7]: generateListingItemObjects
     * [8]: generateObjectDatas
     * [9]: profileId
     * [10]: generateListingItem
     * [11]: marketId
     *
     * @param generateParams
     */
    constructor(generateParams?: any[]);
    toParamsArray(): any[];
}
