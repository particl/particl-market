// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

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
    public generateItemLocation = true;
    public generateShippingDestinations = true;
    public generateItemImages = true;

    // GeneratePaymentInformationParamsInterface
    public generateEscrow = true;
    public generateItemPrice = true;

    // GenerateListingItemObjectParamsInterface
    public generateObjectDatas = true;

    public listingItemTemplateHash: string | null = null;
    public seller: string | null = null;
    public categoryId: number | null = null;

    /**
     * generateParams[]:
     * [0]: generateItemInformation
     * [1]: generateItemLocation
     * [2]: generateShippingDestinations
     * [3]: generateItemImages
     * [4]: generatePaymentInformation
     * [5]: generateEscrow
     * [6]: generateItemPrice
     * [7]: generateMessagingInformation
     * [8]: generateListingItemObjects
     * [9]: generateObjectDatas
     * [10]: listingItemTemplateHash
     * [11]: seller
     * [12]: categoryId
     *
     * TODO: add proposal generation
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams) ) {
            this.generateItemInformation        = generateParams[0] ? true : false;
            this.generateItemLocation           = generateParams[1] ? true : false;
            this.generateShippingDestinations   = generateParams[2] ? true : false;
            this.generateItemImages             = generateParams[3] ? true : false;
            this.generatePaymentInformation     = generateParams[4] ? true : false;
            this.generateEscrow                 = generateParams[5] ? true : false;
            this.generateItemPrice              = generateParams[6] ? true : false;
            this.generateMessagingInformation   = generateParams[7] ? true : false;
            this.generateListingItemObjects     = generateParams[8] ? true : false;
            this.generateObjectDatas            = generateParams[9] ? true : false;
            this.listingItemTemplateHash        = generateParams[10] ? generateParams[10] : null;
            this.seller                         = generateParams[11] ? generateParams[11] : null;
            this.categoryId                     = generateParams[12] ? generateParams[12] : null;
        }
    }

    public toParamsArray(): any[] {
        return [
            this.generateItemInformation,
            this.generateItemLocation,
            this.generateShippingDestinations,
            this.generateItemImages,
            this.generatePaymentInformation,
            this.generateEscrow,
            this.generateItemPrice,
            this.generateMessagingInformation,
            this.generateListingItemObjects,
            this.generateObjectDatas,
            this.listingItemTemplateHash,
            this.seller,
            this.categoryId
        ];
    }

}
