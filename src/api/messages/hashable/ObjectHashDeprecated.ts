// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as crypto from 'crypto-js';
import * as _ from 'lodash';
import { HashableObjectTypeDeprecated } from '../../enums/HashableObjectTypeDeprecated';
import { HashableListingItem } from './HashableListingItem';
import { HashableItemImage } from './HashableItemImage';
import { HashableOrder } from './HashableOrder';
import { HashableProposal } from './HashableProposal';
import { HashableProposalOption } from './HashableProposalOption';
import { Logger as LoggerType } from '../../../core/Logger';
import { HashableBid } from './HashableBid';

export class ObjectHashDeprecated {

    /**
     *
     * @param objectToHash
     * @param {HashableObjectTypeDeprecated} type
     * @param {string[]} extraData
     * @returns {string}
     */
    public static getHash(
        objectToHash: any,
        type: HashableObjectTypeDeprecated,
        extraData: any[] = []
    ): string {


        let hashableObject;
        switch (type) {
            case HashableObjectTypeDeprecated.LISTINGITEM_CREATEREQUEST:
            case HashableObjectTypeDeprecated.LISTINGITEMTEMPLATE_CREATEREQUEST:
            case HashableObjectTypeDeprecated.LISTINGITEM:
            case HashableObjectTypeDeprecated.LISTINGITEMTEMPLATE: {
                const timestampedHash = extraData[0] || false;
                hashableObject = new HashableListingItem(objectToHash, timestampedHash);
                break;
            }
            case HashableObjectTypeDeprecated.ITEMIMAGEDATA_CREATEREQUEST:
            case HashableObjectTypeDeprecated.ITEMIMAGE: {
                hashableObject = new HashableItemImage(objectToHash);
                break;
            }
            case HashableObjectTypeDeprecated.ORDER_CREATEREQUEST: {
                hashableObject = new HashableOrder(objectToHash);
                break;
            }
            case HashableObjectTypeDeprecated.BID_CREATEREQUEST: {
                hashableObject = new HashableBid(objectToHash);
                break;
            }
            case HashableObjectTypeDeprecated.PROPOSAL_MESSAGE:
            case HashableObjectTypeDeprecated.PROPOSAL_CREATEREQUEST: {
                hashableObject = new HashableProposal(objectToHash);
                break;
            }
            case HashableObjectTypeDeprecated.PROPOSALOPTION_CREATEREQUEST: {
                hashableObject = new HashableProposalOption(objectToHash);
                break;
            }
            case HashableObjectTypeDeprecated.DEFAULT: {
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
