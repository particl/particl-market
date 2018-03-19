import { Bookshelf as Database } from '../../config/Database';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../core/api/Validate';
import { Logger as LoggerType } from '../../core/Logger';
import { Types, Core, Targets } from '../../constants';
import * as _ from 'lodash';
import * as Faker from 'faker';
import { MessageException } from '../exceptions/MessageException';
import { TestDataCreateRequest } from '../requests/TestDataCreateRequest';
import { ShippingCountries } from '../../core/helpers/ShippingCountries';
import { ShippingAvailability } from '../enums/ShippingAvailability';
import { MessagingProtocolType } from '../enums/MessagingProtocolType';
import { CryptocurrencyAddressType } from '../enums/CryptocurrencyAddressType';
import { Currency } from '../enums/Currency';
import { ImageDataProtocolType } from '../enums/ImageDataProtocolType';
import { PaymentType } from '../enums/PaymentType';
import { EscrowType } from '../enums/EscrowType';
import { ListingItem } from '../models/ListingItem';
import { Profile } from '../models/Profile';
import { ItemCategory } from '../models/ItemCategory';
import { FavoriteItem } from '../models/FavoriteItem';
import { PaymentInformation } from '../models/PaymentInformation';
import { ListingItemTemplate } from '../models/ListingItemTemplate';

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

import { TestDataGenerateRequest } from '../requests/TestDataGenerateRequest';
import { ProfileCreateRequest } from '../requests/ProfileCreateRequest';
import { Address } from '../models/Address';
import { CryptocurrencyAddress } from '../models/CryptocurrencyAddress';
import { ItemInformation } from '../models/ItemInformation';
import { Bid } from '../models/Bid';
import { ItemImage } from '../models/ItemImage';

import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemTemplateCreateRequest } from '../requests/ListingItemTemplateCreateRequest';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import { FavoriteItemCreateRequest } from '../requests/FavoriteItemCreateRequest';
import { ItemInformationCreateRequest } from '../requests/ItemInformationCreateRequest';
import { BidCreateRequest } from '../requests/BidCreateRequest';
import { PaymentInformationCreateRequest } from '../requests/PaymentInformationCreateRequest';
import { ItemImageCreateRequest } from '../requests/ItemImageCreateRequest';
import { CreatableModel } from '../enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../requests/params/GenerateListingItemTemplateParams';
import { GenerateListingItemParams } from '../requests/params/GenerateListingItemParams';
import { GenerateProfileParams } from '../requests/params/GenerateProfileParams';
import { GenerateBidParams } from '../requests/params/GenerateBidParams';
import {ImageProcessing} from '../../core/helpers/ImageProcessing';
import { BidMessageType } from '../enums/BidMessageType';

export class TestDataService {

    public log: LoggerType;
    public ignoreTables: string[] = ['sqlite_sequence', 'version', 'version_lock', 'knex_migrations', 'knex_migrations_lock'];

    constructor(
        @inject(Types.Service) @named(Targets.Service.DefaultItemCategoryService) public defaultItemCategoryService: DefaultItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.DefaultProfileService) public defaultProfileService: DefaultProfileService,
        @inject(Types.Service) @named(Targets.Service.DefaultMarketService) public defaultMarketService: DefaultMarketService,
        @inject(Types.Service) @named(Targets.Service.MarketService) public marketService: MarketService,
        @inject(Types.Service) @named(Targets.Service.ProfileService) public profileService: ProfileService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.FavoriteItemService) private favoriteItemService: FavoriteItemService,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.BidService) private bidService: BidService,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        this.log = new Logger(__filename);
    }

    /**
     * clean up the database
     * insert the default data
     *
     * @param ignoreTables
     * @param seed
     * @returns {Promise<void>}
     */
    public async clean(seed: boolean = true): Promise<void> {

        await this.cleanDb();
        if (seed) {
            this.log.debug('seeding default data after cleaning');
            await this.defaultItemCategoryService.seedDefaultCategories();
            await this.defaultProfileService.seedDefaultProfile();
            await this.defaultMarketService.seedDefaultMarket();
            this.log.info('cleanup & default seeds done.');

            return;
        }
    }

    /**
     * creates testdata from json
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async create<T>( @request(TestDataCreateRequest) body: TestDataCreateRequest): Promise<Bookshelf.Model<any>> {
        switch (body.model) {
            case CreatableModel.LISTINGITEMTEMPLATE: {
                return await this.listingItemTemplateService.create(body.data as ListingItemTemplateCreateRequest) as Bookshelf.Model<ListingItemTemplate>;
            }
            case CreatableModel.LISTINGITEM: {
                return await this.listingItemService.create(body.data as ListingItemCreateRequest) as Bookshelf.Model<ListingItem>;
            }
            case CreatableModel.PROFILE: {
                return await this.profileService.create(body.data as ProfileCreateRequest) as Bookshelf.Model<Profile>;
            }
            case CreatableModel.ITEMCATEGORY: {
                return await this.itemCategoryService.create(body.data as ItemCategoryCreateRequest) as Bookshelf.Model<ItemCategory>;
            }
            case CreatableModel.FAVORITEITEM: {
                return await this.favoriteItemService.create(body.data as FavoriteItemCreateRequest) as Bookshelf.Model<FavoriteItem>;
            }
            case CreatableModel.ITEMINFORMATION: {
                return await this.itemInformationService.create(body.data as ItemInformationCreateRequest) as Bookshelf.Model<ItemInformation>;
            }
            case CreatableModel.BID: {
                return await this.bidService.create(body.data as BidCreateRequest) as Bookshelf.Model<Bid>;
            }
            case CreatableModel.PAYMENTINFORMATION: {
                return await this.paymentInformationService.create(body.data as PaymentInformationCreateRequest) as Bookshelf.Model<PaymentInformation>;
            }
            case CreatableModel.ITEMIMAGE: {
                return await this.itemImageService.create(body.data as ItemImageCreateRequest) as Bookshelf.Model<ItemImage>;
            }
            default: {
                throw new MessageException('Not implemented');
            }
        }
    }

    /**
     * generates testdata
     *
     * @param data
     *  model - listingitemtemplate, listingitem or profile
     *  amount - amount of models to create
     *  withRelated - return full related model data or just id's, defaults to true
     *  generateParams - boolean array from GenerateListingItemTemplateParams
     *
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async generate<T>( @request(TestDataGenerateRequest) body: TestDataGenerateRequest): Promise<Bookshelf.Collection<any>> {
        switch (body.model) {
            case CreatableModel.LISTINGITEMTEMPLATE: {
                const generateParams = new GenerateListingItemTemplateParams(body.generateParams);
                return await this.generateListingItemTemplates(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.LISTINGITEM: {
                const generateParams = new GenerateListingItemParams(body.generateParams);
                return await this.generateListingItems(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.PROFILE: {
                const generateParams = new GenerateProfileParams(body.generateParams);
                return await this.generateProfiles(body.amount, body.withRelated, generateParams);
            }
            case CreatableModel.BID: {
                const generateParams = new GenerateBidParams(body.generateParams);
                return await this.generateBids(body.amount, body.withRelated, generateParams);
            }
            default: {
                throw new MessageException('Not implemented');
            }
        }
    }

    /**
     * clean up the db
     *
     * @returns {Promise<void>}
     */
    private async cleanDb(): Promise<void> {

        // by default ignore these
        this.log.info('cleaning up the db, ignoring tables: ', this.ignoreTables);
        this.log.debug('ignoreTables: ', this.ignoreTables);

        const tablesToClean = [
            'bid_datas',
            'bids',
            'location_markers',
            'item_locations',
            'shipping_destinations',
            'item_image_datas',
            'item_images',
            'item_informations',
            'shipping_prices',
            'item_prices',
            'escrow_ratios',
            'escrows',
            'payment_informations',
            'messaging_informations',
            'listing_item_objects',
            'listing_items',
            'listing_item_templates',
            'addresses',
            'favorite_items',
            'cryptocurrency_addresses',
            'profiles',
            'shopping_cart',
            'shopping_cart_item',
            'item_categories',
            'markets',
            'users',     // todo: not needed
            'price_ticker',
            'flagged_items',
            'currency_prices'
        ];

        for (const table of tablesToClean) {
            // this.log.debug('cleaning table: ', table);
            await Database.knex.select().from(table).del();
        }
        return;
    }

    private async getTableNames(knex: any): Promise<any> {
        return await knex.raw("SELECT name FROM sqlite_master WHERE type='table';");
    }

    // -------------------
    // listingitemtemplates

    private async generateListingItemTemplates(amount: number, withRelated: boolean = true, generateParams: GenerateListingItemTemplateParams): Promise<any> {
        const items: any[] = [];
        for (let i = amount; i > 0; i--) {
            const listingItemTemplate = await this.generateListingItemTemplateData(generateParams);
            const savedListingItemTemplate = await this.listingItemTemplateService.create(listingItemTemplate);
            items.push(savedListingItemTemplate);
        }
        return this.generateResponse(items, withRelated);
    }

    // -------------------
    // listingitems

    private async generateListingItems(amount: number, withRelated: boolean = true, generateParams: GenerateListingItemParams): Promise<any> {
        const items: any[] = [];
        for (let i = amount; i > 0; i--) {
            const listingItem = await this.generateListingItemData(generateParams);
            // this.log.debug('listingItem: ', listingItem);
            const savedListingItem = await this.listingItemService.create(listingItem);
            // this.log.debug('savedListingItem: ', savedListingItem.toJSON());
            items.push(savedListingItem);
        }
        // this.log.debug('items: ', items);

        return await this.generateResponse(items, withRelated);
    }

    // -------------------
    // bids
    private async generateBids(amount: number, withRelated: boolean = true, generateParams: GenerateBidParams): Promise<any> {
        const items: any[] = [];
        for (let i = amount; i > 0; i--) {
            const bid = await this.generateBidData(generateParams);
            const savedBid = await this.bidService.create(bid);
            items.push(savedBid);
        }
        return this.generateResponse(items, withRelated);
    }

    private async generateBidData(generateParams: GenerateBidParams): Promise<BidCreateRequest> {
        //  listingItemId 1 is used if generateListingItem is set to false (default=true)
        let listingItemId = 1;
        if (generateParams.generateListingItem) {
            const listingGenerateParams = new GenerateListingItemParams();
            const listings = await this.generateListingItems(1, true, listingGenerateParams);
            listingItemId = listings[0].id;
            this.log.debug(`generateBidData: generated new listing with id ${listingItemId}, continuing bid creation`);
        }
        return {
            action: BidMessageType.MPA_BID,
            listing_item_id: listingItemId
        } as BidCreateRequest;
    }

    // -------------------
    // profiles

    private async generateProfiles(amount: number, withRelated: boolean = true, generateParams: GenerateProfileParams): Promise<any> {
        const items: any[] = [];
        for (let i = amount; i > 0; i--) {
            const profile = this.generateProfileData(generateParams);
            const savedProfile = await this.profileService.create(profile);
            items.push(savedProfile);
        }
        return this.generateResponse(items, withRelated);
    }

    private async generateResponse(items: any, withRelated: boolean): Promise<any> {
        if (withRelated) {
            return items;
        } else {
            return await items.map(item => item.id);
        }
    }

    private generateProfileData(generateParams: GenerateProfileParams): ProfileCreateRequest {
        const name = 'TEST-' + Faker.name.firstName();
        const address = Faker.finance.bitcoinAddress();

        this.log.debug('generateParams.generateShippingAddresses: ', generateParams.generateShippingAddresses);
        this.log.debug('generateParams.generateCryptocurrencyAddresses: ', generateParams.generateCryptocurrencyAddresses);
        const shippingAddresses = generateParams.generateShippingAddresses ? this.generateAddressesData(_.random(1, 5)) : [];
        const cryptocurrencyAddresses = generateParams.generateCryptocurrencyAddresses ? this.generateCryptocurrencyAddressesData(_.random(1, 5)) : [];

        return {
            name,
            address,
            shippingAddresses,
            cryptocurrencyAddresses
        } as ProfileCreateRequest;
    }

    private generateAddressesData(amount: number): Address[] {
        const addresses: any[] = [];
        for (let i = amount; i > 0; i--) {
            addresses.push({
                firstName: Faker.name.firstName(),
                lastName: Faker.name.lastName(),
                title: Faker.company.companyName(),
                addressLine1: Faker.address.streetAddress(),
                addressLine2: Faker.address.secondaryAddress(),
                zipCode: Faker.address.zipCode(),
                city: Faker.address.city(),
                state: Faker.address.state(),
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryList))
            });
        }
        return addresses;
    }

    private generateCryptocurrencyAddressesData(amount: number): CryptocurrencyAddress[] {
        const cryptoAddresses: any[] = [];
        for (let i = amount; i > 0; i--) {
            cryptoAddresses.push({
                type: Faker.random.arrayElement(Object.getOwnPropertyNames(CryptocurrencyAddressType)),
                address: Faker.finance.bitcoinAddress()
            });
        }
        return cryptoAddresses;
    }

    private async generateListingItemData(generateParams: GenerateListingItemParams): Promise<ListingItemCreateRequest> {
        const defaultMarket = await this.marketService.getDefault();

        const itemInformation = generateParams.generateItemInformation ? this.generateItemInformationData(generateParams) : {};
        const paymentInformation = generateParams.generatePaymentInformation ? this.generatePaymentInformationData(generateParams) : {};
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        // TODO: generate listingitemobjects
        const listingItemObjects = generateParams.generateListingItemObjects ? [] : [];

        const listingItem = {
            hash: Faker.random.uuid(),
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            market_id: defaultMarket.Id
        } as ListingItemCreateRequest;

        return listingItem;
    }

    private generateShippingDestinationsData(amount: number): any[] {
        const items: any[] = [];
        for (let i = amount; i > 0; i--) {
            items.push({
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryList)),
                shippingAvailability: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingAvailability))
            });
        }
        return items;
    }

    private generateItemImagesData(amount: number): any[] {
        const items: any[] = [];
        for (let i = amount; i > 0; i--) {
            const item = {
                hash: Faker.random.uuid(),
                data: [{
                    dataId: Faker.internet.url(),
                    protocol: ImageDataProtocolType.LOCAL,
                    imageVersion: 'ORIGINAL',
                    encoding: 'BASE64',
                    data: ImageProcessing.milkcatSmall
                }]
            };
            items.push(item);
        }
        return items;
    }

    private generateItemInformationData(generateParams: GenerateListingItemTemplateParams): ItemInformationCreateRequest {

        const shippingDestinations = generateParams.generateShippingDestinations
            ? this.generateShippingDestinationsData(_.random(1, 5))
            : [];

        const itemImages = generateParams.generateItemImages
            ? this.generateItemImagesData(_.random(1, 5))
            : [];

        const itemInformation = {
            title: Faker.commerce.productName(),
            shortDescription: Faker.commerce.productAdjective() + ' ' + Faker.commerce.product(),
            longDescription: Faker.lorem.paragraph(),
            itemCategory: {
                key: this.randomCategoryKey()
            },
            itemLocation: {
                region: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryList)),
                address: Faker.address.streetAddress(),
                locationMarker: {
                    markerTitle: Faker.lorem.word(),
                    markerText: Faker.lorem.sentence(),
                    lat: Faker.address.latitude(),
                    lng: Faker.address.longitude()
                }
            },
            shippingDestinations,
            itemImages
        } as ItemInformationCreateRequest;
        return itemInformation;
    }

    private generatePaymentInformationData(generateParams: GenerateListingItemTemplateParams): PaymentInformationCreateRequest {

        const escrow = generateParams.generateEscrow
            ? {
                type: Faker.random.arrayElement(Object.getOwnPropertyNames(EscrowType)),
                ratio: {
                    buyer: _.random(1, 100),
                    seller: _.random(1, 100)
                }
            }
            : {};

        const itemPrice = generateParams.generateItemPrice
            ? {
                currency: Faker.random.arrayElement(Object.getOwnPropertyNames(Currency)),
                basePrice: _.random(123.45, 5.43),
                shippingPrice: {
                    domestic: _.random(5.00, 1.11),
                    international: _.random(10.00, 5.003)
                },
                cryptocurrencyAddress: {
                    type: Faker.random.arrayElement(Object.getOwnPropertyNames(CryptocurrencyAddressType)),
                    address: Faker.finance.bitcoinAddress()
                }
            }
            : {};

        const paymentInformation = {
            type: Faker.random.arrayElement(Object.getOwnPropertyNames(PaymentType)),
            escrow,
            itemPrice
        } as PaymentInformationCreateRequest;
        return paymentInformation;
    }

    private generateMessagingInformationData(): any {
        const messagingInformation = [{
            protocol: Faker.random.arrayElement(Object.getOwnPropertyNames(MessagingProtocolType)),
            publicKey: Faker.random.uuid()
        }];
        return messagingInformation;
    }

    private async generateListingItemTemplateData(generateParams: GenerateListingItemTemplateParams): Promise<ListingItemTemplateCreateRequest> {
        const itemInformation = generateParams.generateItemInformation ? this.generateItemInformationData(generateParams) : {};
        const paymentInformation = generateParams.generatePaymentInformation ? this.generatePaymentInformationData(generateParams) : {};
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        // TODO: generate listingitemobjects
        const listingItemObjects = generateParams.generateListingItemObjects ? [] : [];

        const defaultProfile = await this.profileService.getDefault();

        const listingItemTemplate = {
            hash: Faker.random.uuid(),
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            profile_id: defaultProfile.Id
        } as ListingItemTemplateCreateRequest;
        return listingItemTemplate;
    }


    private randomCategoryKey(): string {
        const categoryKeys = [
            'cat_high_business_corporate', 'cat_high_vehicles_aircraft_yachts', 'cat_high_real_estate', 'cat_high_luxyry_items',
            'cat_high_services', 'cat_housing_vacation_rentals', 'cat_housing_travel_services', 'cat_housing_apartments_rental_housing',
            'cat_apparel_adult', 'cat_apparel_children', 'cat_apparel_bags_luggage', 'cat_apparel_other', 'cat_app_android',
            'cat_app_ios', 'cat_app_windows', 'cat_app_mac', 'cat_app_web_development', 'cat_app_other', 'cat_auto_cars_truck_parts',
            'cat_auto_motorcycle', 'cat_auto_rv_boating', 'cat_auto_other', 'cat_media_books_art_print', 'cat_media_music_physical',
            'cat_media_music_digital', 'cat_media_movies_entertainment', 'cat_media_other', 'cat_mobile_accessories',
            'cat_mobile_cell_phones', 'cat_mobile_tablets', 'cat_mobile_other', 'cat_electronics_home_audio', 'cat_electronics_music_instruments',
            'cat_electronics_automation_security', 'cat_electronics_video_camera', 'cat_electronics_television_monitors',
            'cat_electronics_computers_parts', 'cat_electronics_gaming_esports', 'cat_electronics_other', 'cat_health_diet_nutrition',
            'cat_health_personal_care', 'cat_health_household_supplies', 'cat_health_beauty_products_jewelry', 'cat_health_baby_infant_care',
            'cat_health_other', 'cat_home_furniture', 'cat_home_appliances_kitchenware', 'cat_home_textiles_rugs_bedding',
            'cat_home_hardware_tools', 'cat_home_pet_supplies', 'cat_home_home_office', 'cat_home_sporting_outdoors', 'cat_home_specialty_items',
            'cat_home_other', 'cat_services_commercial', 'cat_services_freelance', 'cat_services_labor_talent', 'cat_services_transport_logistics',
            'cat_services_escrow', 'cat_services_endoflife_estate_inheritance', 'cat_services_legal_admin', 'cat_services_other',
            'cat_wholesale_consumer_goods', 'cat_wholesale_commercial_industrial', 'cat_wholesale_scientific_equipment_supplies',
            'cat_wholesale_scientific_lab_services', 'cat_wholesale_other'
        ];

        const rand = Math.floor(Math.random() * categoryKeys.length);
        return categoryKeys[rand];
    }

}
