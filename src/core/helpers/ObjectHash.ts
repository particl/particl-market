import * as crypto from 'crypto-js';
import { inject, named } from 'inversify';
import { HashableObjectType } from '../../api/enums/HashableObjectType';
import { ListingItemFactory } from '../../api/factories/ListingItemFactory';
import { ImageFactory } from '../../api/factories/ImageFactory';
import { ItemCategoryService } from '../../api/services/ItemCategoryService';
import { MarketService } from '../../api/services/MarketService';
import { Types, Core, Targets } from '../../constants';
import { Logger as LoggerType } from '../../core/Logger';
import { ItemImageDataCreateRequest } from '../../api/requests/ItemImageDataCreateRequest';
import { ImageVersions } from '../../core/helpers/ImageVersionEnumType';


export class ObjectHash {

    public log: LoggerType;

    constructor(
        @inject(Types.Factory) @named(Targets.Factory.ListingItemFactory) public listingItemFactory: ListingItemFactory,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) public itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Factory) @named(Targets.Factory.ImageFactory) public imageFactory: ImageFactory,
        @inject(Types.Core) @named(Core.Logger) Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    public async getHash(obj: any, type: HashableObjectType): Promise<string> {
        let revisedObj;
        switch (type) {
            case HashableObjectType.LISTINGITEM: {
                const rootCategoryWithRelatedModel: any = await this.itemCategoryService.findRoot();
                const rootCategory = rootCategoryWithRelatedModel.toJSON();
                let market;
                if (obj.Market) {
                    market = obj.Market;
                } else {
                    market = await this.marketService.getDefault();
                }

                // call factory for getting filter data(without id's just like message)
                revisedObj = await this.listingItemFactory.getModel(obj, market.id, rootCategory);
                break;
            }
            case HashableObjectType.LISTINGITEMTEMPLATE: {
                // todo
                const itemInformation = obj.ItemInformation;
                const paymentInformation = obj.PaymentInformation;
                const newObject = {
                    ItemInformation: {
                        title: itemInformation.title,
                        short_description: itemInformation.shortDescription,
                        long_description: itemInformation.longDescription,
                        location: {
                            country: itemInformation.ItemLocation.region,
                            address: itemInformation.ItemLocation.address,
                            gps: {
                                marker_title: itemInformation.ItemLocation.LocationMarker.markerTitle,
                                marker_text: itemInformation.ItemLocation.LocationMarker.markerText,
                                lng: itemInformation.ItemLocation.LocationMarker.lng,
                                lat: itemInformation.ItemLocation.LocationMarker.lat
                            }
                        }
                    },
                    PaymentInformation: {
                        type: paymentInformation.type,
                        escrow: {
                            type: paymentInformation.Escrow.type,
                            ratio: {
                                buyer: paymentInformation.Escrow.Ratio.buyer,
                                seller: paymentInformation.Escrow.Ratio.seller
                            }
                        }
                    }
                };
                revisedObj = obj;
                break;
            }
            case HashableObjectType.ITEMIMAGE: {
                // todo
                revisedObj = obj;
                break;
            }
            default: {
                revisedObj = obj;
            }
        }
        return crypto.SHA256(JSON.stringify(revisedObj).split('').sort().toString()).toString();
    }
}
