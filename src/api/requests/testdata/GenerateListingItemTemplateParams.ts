// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';

export interface GenerateListingItemTemplateParamsInterface {
    generateItemInformation: boolean;
    generatePaymentInformation: boolean;
    generateMessagingInformation: boolean;
    generateListingItemObjects: boolean;
    toParamsArray(): boolean[];
}

export interface GenerateItemInformationParamsInterface {
    generateItemLocation: boolean;
    generateShippingDestinations: boolean;
    generateImages: boolean;
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
    public generateItemLocation = true;
    public generateShippingDestinations = true;
    public generateImages = true;
    public generatePaymentInformation = true;
    public generateEscrow = true;
    public generateItemPrice = true;
    public generateMessagingInformation = true;
    public generateListingItemObjects = true;
    public generateObjectDatas = true;
    public profileId: number;               // Profile owning the template

    public generateListingItem = false;
    public soldOnMarketId: number;          // Market on which the ListingItem is sold on (for payment address)
    public categoryId: number;
    public largeImages = false;

    /**
     * generateParams[]:
     * [0]: generateItemInformation
     * [1]: generateItemLocation
     * [2]: generateShippingDestinations
     * [3]: generateImages
     * [4]: generatePaymentInformation
     * [5]: generateEscrow
     * [6]: generateItemPrice
     * [7]: generateMessagingInformation
     * [8]: generateListingItemObjects
     * [9]: generateObjectDatas
     * [10]: profileId
     * [11]: generateListingItem
     * [12]: soldOnMarketId
     * [13]: categoryId
     * [14]: largeImages
     *
     * @param generateParams
     */
    constructor(generateParams: any[] = []) {
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams)) {
            this.generateItemInformation        = generateParams[0] ? true : false;
            this.generateItemLocation           = generateParams[1] ? true : false;
            this.generateShippingDestinations   = generateParams[2] ? true : false;
            this.generateImages                 = generateParams[3] ? true : false;
            this.generatePaymentInformation     = generateParams[4] ? true : false;
            this.generateEscrow                 = generateParams[5] ? true : false;
            this.generateItemPrice              = generateParams[6] ? true : false;
            this.generateMessagingInformation   = generateParams[7] ? true : false;
            this.generateListingItemObjects     = generateParams[8] ? true : false;
            this.generateObjectDatas            = generateParams[9] ? true : false;
            this.profileId                      = generateParams[10] ? generateParams[10] : undefined;
            this.generateListingItem            = generateParams[11] ? true : false;
            this.soldOnMarketId                 = generateParams[12] ? generateParams[12] : undefined;
            this.categoryId                     = generateParams[13] ? generateParams[13] : undefined;
            this.largeImages                    = generateParams[14] ? generateParams[14] : false;
        }
    }

    public toParamsArray(): any[] {
        return [
            this.generateItemInformation,
            this.generateItemLocation,
            this.generateShippingDestinations,
            this.generateImages,
            this.generatePaymentInformation,
            this.generateEscrow,
            this.generateItemPrice,
            this.generateMessagingInformation,
            this.generateListingItemObjects,
            this.generateObjectDatas,
            this.profileId,
            this.generateListingItem,
            this.soldOnMarketId,
            this.categoryId,
            this.largeImages
        ];
    }

}
