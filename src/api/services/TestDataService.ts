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
import { Country } from '../enums/Country';
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
import { TestDataGenerateRequest } from '../requests/TestDataGenerateRequest';
import { ProfileCreateRequest } from '../requests/ProfileCreateRequest';
import { Address } from '../models/Address';
import { CryptocurrencyAddress } from '../models/CryptocurrencyAddress';
import { ListingItemCreateRequest } from '../requests/ListingItemCreateRequest';
import { ListingItemTemplateCreateRequest } from '../requests/ListingItemTemplateCreateRequest';
import { ItemCategoryCreateRequest } from '../requests/ItemCategoryCreateRequest';
import { FavoriteItemCreateRequest } from '../requests/FavoriteItemCreateRequest';

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
    public async clean(ignoreTables: string[], seed: boolean = true): Promise<void> {

        await this.cleanDb(ignoreTables);
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
            case 'listingitemtemplate': {
                return await this.listingItemTemplateService.create(body.data as ListingItemTemplateCreateRequest) as Bookshelf.Model<ListingItemTemplate>;
            }
            case 'listingitem': {
                return await this.listingItemService.create(body.data as ListingItemCreateRequest) as Bookshelf.Model<ListingItem>;
            }
            case 'profile': {
                return await this.profileService.create(body.data as ProfileCreateRequest) as Bookshelf.Model<Profile>;
            }
            case 'itemcategory': {
                return await this.itemCategoryService.create(body.data as ItemCategoryCreateRequest) as Bookshelf.Model<ItemCategory>;
            }
            case 'favoriteitem': {
                return await this.favoriteItemService.create(body.data as FavoriteItemCreateRequest) as Bookshelf.Model<FavoriteItem>;
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
     *
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async generate<T>( @request(TestDataGenerateRequest) body: TestDataGenerateRequest): Promise<Bookshelf.Collection<any>> {
        switch (body.model) {
            case 'listingitemtemplate': {
                return await this.generateListingItemTemplates(body.amount, body.withRelated);
            }
            case 'listingitem': {
                return await this.generateListingItems(body.amount, body.withRelated);
            }
            case 'profile': {
                return await this.generateProfiles(body.amount, body.withRelated);
            }
            default: {
                throw new MessageException('Not implemented');
            }
        }
    }

    /**
     * clean up the db
     * todo: ignoreTables not used
     *
     * @param ignoreTables
     * @returns {Promise<void>}
     */
    private async cleanDb(ignoreTables: string[]): Promise<void> {

        // by default ignore these
        ignoreTables = this.ignoreTables.concat(ignoreTables);
        this.log.info('cleaning up the db, ignoring tables: ', this.ignoreTables);
        const options = {
            mode: 'delete',
            ignoreTables
        };
        this.log.debug('ignoreTables: ', ignoreTables);

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
            'item_categories',
            'markets',
            'users'     // todo: not needed
        ];

        /*
        const existingTables = await this.getTableNames(Database.knex);
        this.log.debug('existingTables: ', existingTables);

        const tablesToClean = existingTables
            .map( (table) => {
                return table.name; // [Object.keys(table)[0]];
            })
            .filter( (tableName) => {
                return !_.includes(ignoreTables, tableName);
            });
        */
        // this.log.debug('tablesToClean: ', tablesToClean);
        for (const table of tablesToClean) {
            this.log.debug('cleaning table: ', table);
            await Database.knex.select().from(table).del();
        }
        return;
    }

    private async getTableNames(knex: any): Promise<any> {
        return await knex.raw("SELECT name FROM sqlite_master WHERE type='table';");
    }

    // -------------------
    // listingitemtemplates

    private async generateListingItemTemplates(amount: number, withRelated: boolean = true): Promise<any> {
        const items: any[] = [];
        for (let i = amount; i !== 0; i--) {
            const listingItemTemplate = await this.generateListingItemTemplateData();
            // this.log.debug('B1', JSON.stringify(listingItemTemplate, null, 2));
            const savedListingItemTemplate = await this.listingItemTemplateService.create(listingItemTemplate);
            this.log.debug('B2', JSON.stringify(savedListingItemTemplate, null, 2));
            items.push(savedListingItemTemplate);
        }
        return this.generateResponse(items, withRelated);
    }

    // -------------------
    // listingitems

    private async generateListingItems(amount: number, withRelated: boolean = true): Promise<any> {
        const items: any[] = [];
        for (let i = amount; i !== 0; i--) {
            const listingItem = await this.generateListingItemData();
            const savedListingItem = await this.listingItemService.create(listingItem);
            items.push(savedListingItem);
        }
        return this.generateResponse(items, withRelated);
    }

    // -------------------
    // profiles

    private async generateProfiles(amount: number, withRelated: boolean = true): Promise<any> {
        const items: any[] = [];
        for (let i = amount; i !== 0; i--) {
            const profile = this.generateProfileData();
            const savedProfile = await this.profileService.create(profile);
            items.push(savedProfile);
        }
        return this.generateResponse(items, withRelated);
    }

    private generateResponse(items: any, withRelated: boolean): Promise<any> {
        if (withRelated) {
            return items;
        } else {
            return items.map(item => item.id);
        }
    }

    private generateProfileData(): ProfileCreateRequest {
        const name = 'TEST-' + Faker.name.firstName();
        const address = Faker.finance.bitcoinAddress();
        const shippingAddresses = this.generateAddressesData(_.random(1, 5));
        const cryptocurrencyAddresses = this.generateCryptocurrencyAddressesData(_.random(1, 5));

        return {
            name,
            address,
            shippingAddresses,
            cryptocurrencyAddresses
        } as ProfileCreateRequest;
    }

    private generateAddressesData(amount: number): Address[] {
        const addresses: any[] = [];
        for (let i = amount; i !== 0; i--) {
            addresses.push({
                title: Faker.company.companyName(),
                addressLine1: Faker.address.streetAddress(),
                addressLine2: Faker.address.secondaryAddress(),
                city: Faker.address.city(),
                country: Faker.address.country()
            });
        }
        return addresses;
    }

    private generateCryptocurrencyAddressesData(amount: number): CryptocurrencyAddress[] {
        const cryptoAddresses: any[] = [];
        for (let i = amount; i !== 0; i--) {
            cryptoAddresses.push({
                type: Faker.random.arrayElement(Object.getOwnPropertyNames(CryptocurrencyAddressType)),
                address: Faker.finance.bitcoinAddress()
            });
        }
        return cryptoAddresses;
    }

    private async generateListingItemData(): Promise<any> {
        const defaultMarket = await this.marketService.getDefault();
        const itemInformation = this.generateItemInformationData();
        const paymentInformation = this.generatePaymentInformationData();
        const messagingInformation = this.generateMessagingInformationData();

        const listingItem = {
            hash: Faker.random.uuid(),
            itemInformation,
            paymentInformation,
            messagingInformation,
            market_id: defaultMarket.id
            // TODO: ignoring listingitemobjects for now
        };

        return listingItem;
    }

    private generateShippingDestinationsData(amount: number): any[] {
        const items: any[] = [];
        for (let i = amount; i !== 0; i--) {
            items.push({
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(Country)),
                shippingAvailability: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingAvailability))
            });
        }
        return items;
    }

    private generateItemImagesData(amount: number): any[] {
        const items: any[] = [];
        for (let i = amount; i !== 0; i--) {
            const item = {
                hash: Faker.random.uuid(),
                data: {
                    dataId: Faker.internet.url(),
                    protocol: Faker.random.arrayElement(Object.getOwnPropertyNames(ImageDataProtocolType)),
                    encoding: Faker.hacker.abbreviation(),
                    data: Faker.random.image()
                }
            };
            items.push(item);
        }
        return items;
    }

    private generateItemInformationData(): any {
        const shippingDestinations = this.generateShippingDestinationsData(_.random(1, 5));
        const itemImages = this.generateItemImagesData(_.random(1, 5));
        const itemInformation = {
            title: Faker.commerce.productName(),
            shortDescription: Faker.commerce.productAdjective() + ' ' + Faker.commerce.product(),
            longDescription: Faker.lorem.paragraph(),
            itemCategory: {
                key: this.randomCategoryKey()
            },
            itemLocation: {
                region: Faker.random.arrayElement(Object.getOwnPropertyNames(Country)),
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
        };
        return itemInformation;
    }

    private generatePaymentInformationData(): any {
        const paymentInformation = {
            type: Faker.random.arrayElement(Object.getOwnPropertyNames(PaymentType)),
            escrow: {
                type: Faker.random.arrayElement(Object.getOwnPropertyNames(EscrowType)),
                ratio: {
                    buyer: _.random(1, 100),
                    seller: _.random(1, 100)
                }
            },
            itemPrice: {
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
        };
        return paymentInformation;
    }

    private generateMessagingInformationData(): any {
        const messagingInformation = {
            protocol: Faker.random.arrayElement(Object.getOwnPropertyNames(MessagingProtocolType)),
            publicKey: Faker.random.uuid()
        };
        return messagingInformation;
    }

    private async generateListingItemTemplateData(): Promise<any> {
        const itemInformation = this.generateItemInformationData();
        const paymentInformation = this.generatePaymentInformationData();
        const messagingInformation = this.generateMessagingInformationData();
        const defaultProfile = await this.profileService.getDefault();

        const listingItemTemplate = {
            hash: Faker.random.uuid(),
            itemInformation,
            paymentInformation,
            messagingInformation,
            // TODO: ignoring listingitemobjects for now
            profile_id: defaultProfile.Id
        };
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
