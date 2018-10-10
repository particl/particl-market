"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class GenerateListingItemParams {
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
    constructor(generateParams = []) {
        // GenerateListingItemTemplateParamsInterface
        this.generateItemInformation = true;
        this.generatePaymentInformation = true;
        this.generateMessagingInformation = true;
        this.generateListingItemObjects = true;
        // GenerateItemInformationParamsInterface
        this.generateItemLocation = true;
        this.generateShippingDestinations = true;
        this.generateItemImages = true;
        // GeneratePaymentInformationParamsInterface
        this.generateEscrow = true;
        this.generateItemPrice = true;
        // GenerateListingItemObjectParamsInterface
        this.generateObjectDatas = true;
        this.listingItemTemplateHash = null;
        this.seller = null;
        this.categoryId = null;
        // set params only if there are some -> by default all are true
        if (!_.isEmpty(generateParams)) {
            this.generateItemInformation = generateParams[0] ? true : false;
            this.generateItemLocation = generateParams[1] ? true : false;
            this.generateShippingDestinations = generateParams[2] ? true : false;
            this.generateItemImages = generateParams[3] ? true : false;
            this.generatePaymentInformation = generateParams[4] ? true : false;
            this.generateEscrow = generateParams[5] ? true : false;
            this.generateItemPrice = generateParams[6] ? true : false;
            this.generateMessagingInformation = generateParams[7] ? true : false;
            this.generateListingItemObjects = generateParams[8] ? true : false;
            this.generateObjectDatas = generateParams[9] ? true : false;
            this.listingItemTemplateHash = generateParams[10] ? generateParams[10] : null;
            this.seller = generateParams[11] ? generateParams[11] : null;
            this.categoryId = generateParams[12] ? generateParams[12] : null;
        }
    }
    toParamsArray() {
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
exports.GenerateListingItemParams = GenerateListingItemParams;
//# sourceMappingURL=GenerateListingItemParams.js.map