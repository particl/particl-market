import * as crypto from 'crypto-js';
import { inject, named } from 'inversify';
import { HashableObjectType } from '../../api/enums/HashableObjectType';
import { ListingItemFactory } from '../../api/factories/ListingItemFactory';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { ItemCategoryService } from '../../api/services/ItemCategoryService';

export class ObjectHash {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getHash(objectToHash: any, type: HashableObjectType): Promise<string> {
        let hashableObject;
        switch (type) {
            case HashableObjectType.LISTINGITEM:
            case HashableObjectType.LISTINGITEMTEMPLATE: {
                const templateOrItem = objectToHash;
                const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
                const templateOrItemCategoryWithRelated = rootCategoryWithRelatedModel.toJSON();
                hashableObject = await this.listingItemFactory.getMessage(templateOrItem, templateOrItemCategoryWithRelated);
                delete hashableObject.hash;
                break;
            }
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
        }
        return crypto.SHA256(JSON.stringify(hashableObject).split('').sort().toString()).toString();
    }
}
