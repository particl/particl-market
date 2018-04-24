import { GenerateItemInformationParamsInterface, GeneratePaymentInformationParamsInterface } from './GenerateListingItemTemplateParams';
export interface GenerateListingItemParamsInterface {
    generateItemInformation: boolean;
    generatePaymentInformation: boolean;
    generateMessagingInformation: boolean;
    generateListingItemObjects: boolean;
    toParamsArray(): boolean[];
}
export declare class GenerateListingItemParams implements GenerateListingItemParamsInterface, GenerateItemInformationParamsInterface, GeneratePaymentInformationParamsInterface {
    generateItemInformation: boolean;
    generatePaymentInformation: boolean;
    generateMessagingInformation: boolean;
    generateListingItemObjects: boolean;
    generateShippingDestinations: boolean;
    generateItemImages: boolean;
    generateEscrow: boolean;
    generateItemPrice: boolean;
    generateObjectDatas: boolean;
    listingItemTemplateHash: string | null;
    seller: string | null;
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
     * [9]: listingItemTemplateHash
     * [10]: seller
     *
     * @param generateParams
     */
    constructor(generateParams?: any[]);
    toParamsArray(): any[];
}
