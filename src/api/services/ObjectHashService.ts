import * as crypto from 'crypto-js';
import { inject, named } from 'inversify';
import { HashableObjectType } from '../../api/enums/HashableObjectType';
import { ListingItemFactory } from '../../api/factories/ListingItemFactory';
import { ImageFactory } from '../../api/factories/ImageFactory';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { ListingItemMessage } from '../messages/ListingItemMessage';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { HashableListingItem } from '../../core/api/HashableListingItem';

export class ObjectHashService {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Factory) @named(Targets.Factory.ImageFactory) public imageFactory: ImageFactory,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    // TODO: any?
    public async getHash(objectToHash: any, type: HashableObjectType): Promise<string> {
        let hashableObject;
        switch (type) {
            case HashableObjectType.LISTINGITEM_CREATEREQUEST:
            case HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST:
            case HashableObjectType.LISTINGITEM:
            case HashableObjectType.LISTINGITEMTEMPLATE: {
                hashableObject = new HashableListingItem(objectToHash);
                break;
            }
            case HashableObjectType.ITEMIMAGE_CREATEREQUEST:
            case HashableObjectType.ITEMIMAGE: {
                // create the hash from ORIGINAL imageversion
                const imageData = objectToHash.getOriginalImageVersionData();
                hashableObject = {
                    protocol: imageData.protocol,
                    encoding: imageData.encoding,
                    data: imageData.data,
                    id: imageData.dataId
                };
                break;
            }
            case HashableObjectType.DEFAULT: {
                hashableObject = objectToHash;
            }
        }
        return crypto.SHA256(JSON.stringify(hashableObject).split('').sort().toString()).toString();
    }

}
