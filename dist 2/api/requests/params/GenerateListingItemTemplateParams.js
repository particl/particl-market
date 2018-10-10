"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const _ = require("lodash");
class GenerateListingItemTemplateParams {
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
     * [10]: profileId
     * [11]: generateListingItem
     * [12]: marketId
     * [13]: categoryId
     *
     * @param generateParams
     */
    constructor(generateParams = []) {
        // GenerateListingItemTemplateParamsInterface
        this.generateItemInformation = true;
        this.generateItemLocation = true;
        this.generateShippingDestinations = true;
        this.generateItemImages = true;
        this.generatePaymentInformation = true;
        this.generateEscrow = true;
        this.generateItemPrice = true;
        this.generateMessagingInformation = true;
        this.generateListingItemObjects = true;
        this.generateObjectDatas = true;
        this.profileId = null;
        this.generateListingItem = false;
        this.marketId = null;
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
            this.profileId = generateParams[10] ? generateParams[10] : null;
            this.generateListingItem = generateParams[11] ? true : false;
            this.marketId = generateParams[12] ? generateParams[12] : null;
            this.categoryId = generateParams[13] ? generateParams[13] : null;
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
            this.profileId,
            this.generateListingItem,
            this.marketId,
            this.categoryId
        ];
    }
}
exports.GenerateListingItemTemplateParams = GenerateListingItemTemplateParams;
//# sourceMappingURL=GenerateListingItemTemplateParams.js.map