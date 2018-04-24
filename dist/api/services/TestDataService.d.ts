import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../core/Logger';
import { TestDataCreateRequest } from '../requests/TestDataCreateRequest';
import { ListingItemService } from './ListingItemService';
import { ListingItemTemplateService } from './ListingItemTemplateService';
import { DefaultItemCategoryService } from './DefaultItemCategoryService';
import { DefaultProfileService } from './DefaultProfileService';
import { DefaultMarketService } from './DefaultMarketService';
import { ProfileService } from './ProfileService';
import { MarketService } from './MarketService';
import { ItemCategoryService } from './ItemCategoryService';
import { FavoriteItemService } from './FavoriteItemService';
import { ItemInformationService } from './ItemInformationService';
import { BidService } from './BidService';
import { PaymentInformationService } from './PaymentInformationService';
import { ItemImageService } from './ItemImageService';
import { ActionMessageService } from './ActionMessageService';
import { TestDataGenerateRequest } from '../requests/TestDataGenerateRequest';
import { CoreRpcService } from './CoreRpcService';
import { OrderService } from './OrderService';
import { OrderFactory } from '../factories/OrderFactory';
export declare class TestDataService {
    defaultItemCategoryService: DefaultItemCategoryService;
    defaultProfileService: DefaultProfileService;
    defaultMarketService: DefaultMarketService;
    marketService: MarketService;
    profileService: ProfileService;
    private listingItemTemplateService;
    private listingItemService;
    private itemCategoryService;
    private favoriteItemService;
    private itemInformationService;
    private bidService;
    private orderService;
    private itemImageService;
    private paymentInformationService;
    private actionMessageService;
    private coreRpcService;
    private orderFactory;
    Logger: typeof LoggerType;
    log: LoggerType;
    ignoreTables: string[];
    constructor(defaultItemCategoryService: DefaultItemCategoryService, defaultProfileService: DefaultProfileService, defaultMarketService: DefaultMarketService, marketService: MarketService, profileService: ProfileService, listingItemTemplateService: ListingItemTemplateService, listingItemService: ListingItemService, itemCategoryService: ItemCategoryService, favoriteItemService: FavoriteItemService, itemInformationService: ItemInformationService, bidService: BidService, orderService: OrderService, itemImageService: ItemImageService, paymentInformationService: PaymentInformationService, actionMessageService: ActionMessageService, coreRpcService: CoreRpcService, orderFactory: OrderFactory, Logger: typeof LoggerType);
    /**
     * clean up the database
     * insert the default data
     *
     * @param ignoreTables
     * @param seed
     * @returns {Promise<void>}
     */
    clean(seed?: boolean): Promise<void>;
    /**
     * creates testdata from json
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    create<T>(body: TestDataCreateRequest): Promise<Bookshelf.Model<any>>;
    /**
     * generates testdata
     *
     * @param data
     *  model - listingitemtemplate, listingitem or profile
     *  amount - amount of models to create
     *  withRelated - return full related model data or just id's, defaults to true
     *  generateParams - boolean array from GenerateListingItemTemplateParams
     *
     * @returns {Promise<any>}
     */
    generate<T>(body: TestDataGenerateRequest): Promise<any>;
    /**
     * clean up the db
     *
     * @returns {Promise<void>}
     */
    private cleanDb();
    private getTableNames(knex);
    private generateListingItemTemplates(amount, withRelated, generateParams);
    private generateListingItems(amount, withRelated, generateParams);
    private generateBids(amount, withRelated, generateParams);
    private generateBidData(generateParams);
    private generateOrders(amount, withRelated, generateParams);
    private generateOrderData(generateParams);
    private generateProfiles(amount, withRelated, generateParams);
    private generateResponse(items, withRelated);
    private generateProfileData(generateParams);
    private generateAddressesData(amount);
    private generateCryptocurrencyAddressesData(amount);
    private generateListingItemData(generateParams);
    private generateShippingDestinationsData(amount);
    private generateItemImagesData(amount);
    private generateItemInformationData(generateParams);
    private generatePaymentInformationData(generateParams);
    private generateMessagingInformationData();
    private generateListingItemObjectsData(generateParams);
    private generateObjectDataData(amount);
    private generateListingItemTemplateData(generateParams);
    private randomCategoryKey();
}
