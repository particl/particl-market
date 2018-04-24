import * as crypto from 'crypto-js';
import { HashableObjectType } from '../../api/enums/HashableObjectType';
import { HashableListingItem } from './HashableListingItem';
import { HashableItemImage } from './HashableItemImage';
import { HashableOrder } from './HashableOrder';
import { Logger as LoggerType } from '../Logger';

export class ObjectHash {

    /**
     *
     * @param objectToHash
     * @param {HashableObjectType} type
     * @returns {string}
     */
    public static getHash(
        objectToHash: any,
        type: HashableObjectType,
        timestampedHash: boolean = false
    ): string {

        const log: LoggerType = new LoggerType(__filename);

        let hashableObject;
        switch (type) {
            case HashableObjectType.LISTINGITEM_CREATEREQUEST:
            case HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST:
            case HashableObjectType.LISTINGITEM:
            case HashableObjectType.LISTINGITEMTEMPLATE: {
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
