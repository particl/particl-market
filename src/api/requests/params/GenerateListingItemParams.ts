import * as _ from 'lodash';
import { GenerateItemInformationParamsInterface, GeneratePaymentInformationParamsInterface } from './GenerateListingItemTemplateParams';

export interface GenerateListingItemParamsInterface {
    generateItemInformation: boolean;
    generatePaymentInformation: boolean;
    generateMessagingInformation: boolean;
    generateListingItemObjects: boolean;
    toParamsArray(): boolean[];
}

export class GenerateListingItemParams implements GenerateListingItemParamsInterface,
    GenerateItemInformationParamsInterface, GeneratePaymentInformationParamsInterface {

    // GenerateListingItemTemplateParamsInterface
    public generateItemInformation = true;
    public generatePaymentInformation = true;
    public generateMessagingInformation = true;
    public generateListingItemObjects = true;

    // GenerateItemInformationParamsInterface
    public generateShippingDestinations = true;
    public generateItemImages = true;

    // GeneratePaymentInformationParamsInterface
    public generateEscrow = true;
    public generateItemPrice = true;

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
     *
     * @param generateParams
     */
    constructor(generateParams: boolean[] = []) {
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateItemInformation        = generateParams[0] ? true : false;
            this.generateShippingDestinations   = generateParams[1] ? true : false;
            this.generateItemImages             = generateParams[2] ? true : false;

            this.generatePaymentInformation     = generateParams[3] ? true : false;
            this.generateEscrow                 = generateParams[4] ? true : false;
            this.generateItemPrice              = generateParams[5] ? true : false;

            this.generateMessagingInformation   = generateParams[6] ? true : false;

            this.generateListingItemObjects     = generateParams[7] ? true : false;
        }
    }

    public toParamsArray(): boolean[] {
        return [
            this.generateItemInformation,
            this.generateShippingDestinations,
            this.generateItemImages,
            this.generatePaymentInformation,
            this.generateEscrow,
            this.generateItemPrice,
            this.generateMessagingInformation,
            this.generateListingItemObjects
        ];
    }

}
