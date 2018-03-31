import * as crypto from 'crypto-js';
import { HashableObjectType } from '../../api/enums/HashableObjectType';
import { HashableListingItem } from './HashableListingItem';
import { HashableItemImage } from './HashableItemImage';

export class ObjectHash {

    public static getHash(objectToHash: any, type: HashableObjectType): string {

        let hashableObject;
        switch (type) {
            case HashableObjectType.LISTINGITEM_CREATEREQUEST:
            case HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST:
            case HashableObjectType.LISTINGITEM:
            case HashableObjectType.LISTINGITEMTEMPLATE: {
                hashableObject = new HashableListingItem(objectToHash);
                break;
            }
            case HashableObjectType.ITEMIMAGEDATA_CREATEREQUEST:
            case HashableObjectType.ITEMIMAGE: {
                hashableObject = new HashableItemImage(objectToHash);
                break;
            }
            case HashableObjectType.DEFAULT: {
                hashableObject = objectToHash;
            }
        }
        return crypto.SHA256(JSON.stringify(hashableObject).split('').sort().toString()).toString();
    }
}
