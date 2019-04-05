// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import { HashableObjectType } from '../../api/enums/HashableObjectType';
import { HashableListingItem } from './HashableListingItem';
import { HashableItemImage } from './HashableItemImage';
import { HashableOrder } from './HashableOrder';
import { HashableProposal } from './HashableProposal';
import { HashableProposalOption } from './HashableProposalOption';
import { Logger as LoggerType } from '../Logger';
import { HashableBid } from './HashableBid';

export class ObjectHash {

    /**
     *
     * @param objectToHash
     * @param {HashableObjectType} type
     * @param {string[]} extraData
     * @returns {string}
     */
    public static getHash(
        objectToHash: any,
        type: HashableObjectType,
        extraData: any[] = []
    ): string {

        const log: LoggerType = new LoggerType(__filename);

        let hashableObject;
        switch (type) {
            case HashableObjectType.LISTINGITEM_CREATEREQUEST:
            case HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST:
            case HashableObjectType.LISTINGITEM:
            case HashableObjectType.LISTINGITEMTEMPLATE: {
                const timestampedHash = extraData[0] || false;
                hashableObject = new HashableListingItem(objectToHash, timestampedHash);
                break;
            }
            case HashableObjectType.ITEMIMAGEDATA_CREATEREQUEST:
            case HashableObjectType.ITEMIMAGE: {
                hashableObject = new HashableItemImage(objectToHash);
                break;
            }
            case HashableObjectType.ORDER_CREATEREQUEST: {
                hashableObject = new HashableOrder(objectToHash);
                break;
            }
            case HashableObjectType.BID_CREATEREQUEST: {
                hashableObject = new HashableBid(objectToHash);
                break;
            }
            case HashableObjectType.PROPOSAL_MESSAGE:
            case HashableObjectType.PROPOSAL_CREATEREQUEST: {
                hashableObject = new HashableProposal(objectToHash);
                break;
            }
            case HashableObjectType.PROPOSALOPTION_CREATEREQUEST: {
                hashableObject = new HashableProposalOption(objectToHash);
                break;
            }
            case HashableObjectType.DEFAULT: {
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
