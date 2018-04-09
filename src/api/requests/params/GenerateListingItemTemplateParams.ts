import * as _ from 'lodash';

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

export class GenerateListingItemTemplateParams implements GenerateListingItemTemplateParamsInterface,
    GenerateItemInformationParamsInterface, GeneratePaymentInformationParamsInterface, GenerateListingItemObjectParamsInterface {

    // GenerateListingItemTemplateParamsInterface
    public generateItemInformation = true;
    public generatePaymentInformation = true;
    public generateMessagingInformation = true;
    public generateListingItemObjects = true;
    public generateShippingDestinations = true;
    public generateItemImages = true;
    public generateEscrow = true;
    public generateItemPrice = true;
    public generateObjectDatas = true;
    public profileId = null;

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
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams)) {
            this.generateItemInformation = generateParams[0] ? true : false;
            this.generateShippingDestinations = generateParams[1] ? true : false;
            this.generateItemImages = generateParams[2] ? true : false;
            this.generatePaymentInformation = generateParams[3] ? true : false;
            this.generateEscrow = generateParams[4] ? true : false;
            this.generateItemPrice = generateParams[5] ? true : false;
            this.generateMessagingInformation = generateParams[6] ? true : false;
            this.generateListingItemObjects = generateParams[7] ? true : false;
            this.generateObjectDatas = generateParams[8] ? true : false;
            this.profileId = generateParams[9] ? generateParams[9] : null;
        }
    }

    public toParamsArray(): any[] {
        return [
            this.generateItemInformation,
            this.generateShippingDestinations,
            this.generateItemImages,
            this.generatePaymentInformation,
            this.generateEscrow,
            this.generateItemPrice,
            this.generateMessagingInformation,
            this.generateListingItemObjects,
            this.generateObjectDatas,
            this.profileId
        ];
    }

}
