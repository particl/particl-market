"use strict";
// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = require("crypto-js");
const HashableObjectType_1 = require("../../api/enums/HashableObjectType");
const HashableListingItem_1 = require("./HashableListingItem");
const HashableItemImage_1 = require("./HashableItemImage");
const HashableOrder_1 = require("./HashableOrder");
const HashableProposal_1 = require("./HashableProposal");
const HashableProposalOption_1 = require("./HashableProposalOption");
const Logger_1 = require("../Logger");
class ObjectHash {
    /**
     *
     * @param objectToHash
     * @param {HashableObjectType} type
     * @param {string[]} extraData
     * @param {boolean} timestampedHash
     * @returns {string}
     */
    static getHash(objectToHash, type, extraData = []) {
        const log = new Logger_1.Logger(__filename);
        let hashableObject;
        switch (type) {
            case HashableObjectType_1.HashableObjectType.LISTINGITEM_CREATEREQUEST:
            case HashableObjectType_1.HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST:
            case HashableObjectType_1.HashableObjectType.LISTINGITEM:
            case HashableObjectType_1.HashableObjectType.LISTINGITEMTEMPLATE: {
                const timestampedHash = extraData[0] || false;
                hashableObject = new HashableListingItem_1.HashableListingItem(objectToHash, timestampedHash);
                break;
            }
            case HashableObjectType_1.HashableObjectType.ITEMIMAGEDATA_CREATEREQUEST:
            case HashableObjectType_1.HashableObjectType.ITEMIMAGE: {
                hashableObject = new HashableItemImage_1.HashableItemImage(objectToHash);
                break;
            }
            case HashableObjectType_1.HashableObjectType.ORDER_CREATEREQUEST: {
                hashableObject = new HashableOrder_1.HashableOrder(objectToHash);
                break;
            }
            case HashableObjectType_1.HashableObjectType.PROPOSAL_MESSAGE:
            case HashableObjectType_1.HashableObjectType.PROPOSAL_CREATEREQUEST: {
                hashableObject = new HashableProposal_1.HashableProposal(objectToHash);
                break;
            }
            case HashableObjectType_1.HashableObjectType.PROPOSALOPTION_CREATEREQUEST: {
                hashableObject = new HashableProposalOption_1.HashableProposalOption(objectToHash);
                break;
            }
            case HashableObjectType_1.HashableObjectType.DEFAULT: {
                hashableObject = objectToHash;
            }
        }
        const hash = crypto.SHA256(JSON.stringify(hashableObject).split('').sort().toString()).toString();
        // if (process.env.NODE_ENV === 'test') {
        //    log.debug('hashableObject, ' + type + ': ', JSON.stringify(hashableObject, null, 2));
        //    log.debug('hashableObject, hash: ', hash);
        // }
        return hash;
    }
}
exports.ObjectHash = ObjectHash;
//# sourceMappingURL=ObjectHash.js.map