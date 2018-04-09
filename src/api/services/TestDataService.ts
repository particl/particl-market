import { Bookshelf as Database } from '../../config/Database';
import { Collection } from 'bookshelf';
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
import { ListingItemObjectType } from '../enums/ListingItemObjectType';
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
import { ActionMessageService } from './ActionMessageService';

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
import { ImageProcessing } from '../../core/helpers/ImageProcessing';
import { BidMessageType } from '../enums/BidMessageType';
import { SearchOrder } from '../enums/SearchOrder';
import { AddressCreateRequest } from '../requests/AddressCreateRequest';
import { CryptocurrencyAddressCreateRequest } from '../requests/CryptocurrencyAddressCreateRequest';
import { ActionMessageCreateRequest } from '../requests/ActionMessageCreateRequest';
import { BidDataCreateRequest } from '../requests/BidDataCreateRequest';
import { AddressType } from '../enums/AddressType';
import { ListingItemMessageType } from '../enums/ListingItemMessageType';
import { ActionMessage } from '../models/ActionMessage';
import { CoreRpcService } from './CoreRpcService';
import { GenerateOrderParams } from '../requests/params/GenerateOrderParams';
import { OrderCreateRequest } from '../requests/OrderCreateRequest';
import { OrderItemCreateRequest } from '../requests/OrderItemCreateRequest';
import * as resources from 'resources';
import { OrderStatus } from '../enums/OrderStatus';
import { OrderItemObjectCreateRequest } from '../requests/OrderItemObjectCreateRequest';
import { OrderService } from './OrderService';

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
        @inject(Types.Service) @named(Targets.Service.OrderService) private orderService: OrderService,
        @inject(Types.Service) @named(Targets.Service.ItemImageService) private itemImageService: ItemImageService,
        @inject(Types.Service) @named(Targets.Service.PaymentInformationService) private paymentInformationService: PaymentInformationService,
        @inject(Types.Service) @named(Targets.Service.ActionMessageService) private actionMessageService: ActionMessageService,
        @inject(Types.Service) @named(Targets.Service.CoreRpcService) private coreRpcService: CoreRpcService,
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
                return await this.listingItemTemplateService.create(
                    body.data as ListingItemTemplateCreateRequest,
                    body.timestampedHash) as Bookshelf.Model<ListingItemTemplate>;
            }
            case CreatableModel.LISTINGITEM: {
                return await this.listingItemService.create(body.data as ListingItemCreateRequest) as Bookshelf.Model<ListingItem>;
            }
            case CreatableModel.ACTIONMESSAGE: {
                return await this.actionMessageService.create(body.data as ActionMessageCreateRequest) as Bookshelf.Model<ActionMessage>;
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
     * @returns {Promise<any>}
     */
    @validate()
    public async generate<T>( @request(TestDataGenerateRequest) body: TestDataGenerateRequest ): Promise<any> {
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
            case CreatableModel.ORDER: {
                const generateParams = new GenerateOrderParams(body.generateParams);
                return await this.generateOrders(body.amount, body.withRelated, generateParams);
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
            'message_objects',
            'message_infos',
            'message_escrows',
            'message_datas',
            'action_messages',
            'order_item_objects',
            'order_items',
            'orders',
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
            'listing_item_object_datas',
            'listing_item_objects',
            'listing_items',
            'listing_item_templates',
            'addresses',
            'favorite_items',
            'cryptocurrency_addresses',
            'profiles',
            'shopping_cart_item',
            'shopping_cart',
            'item_categories',
            'markets',
            'users',        // todo: not needed
            'price_ticker', // todo: price_tickers
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

    private async generateListingItemTemplates(
        amount: number, withRelated: boolean = true,
        generateParams: GenerateListingItemTemplateParams):
    Promise<resources.ListingItemTemplate[]> {

        const items: resources.ListingItemTemplate[] = [];
        for (let i = amount; i > 0; i--) {
            const listingItemTemplateCreateRequest = await this.generateListingItemTemplateData(generateParams);
            const listingItemTemplateModel = await this.listingItemTemplateService.create(listingItemTemplateCreateRequest);
            const result = listingItemTemplateModel.toJSON();
            items.push(result);
        }
        return this.generateResponse(items, withRelated);
    }

    // -------------------
    // listingitems

    private async generateListingItems(
        amount: number, withRelated: boolean = true,
        generateParams: GenerateListingItemParams):
    Promise<resources.ListingItem[]> {

        const items: resources.ListingItem[] = [];
        for (let i = amount; i > 0; i--) {

            const listingItemCreateRequest = await this.generateListingItemData(generateParams);

            // TODO: actionmessage generation should be configurable
            const fromAddress = await this.coreRpcService.getNewAddress();

            // add ActionMessage
            listingItemCreateRequest.actionMessages = [{
                action: ListingItemMessageType.MP_ITEM_ADD,
                objects: [{
                    dataId: 'seller',
                    dataValue: listingItemCreateRequest.seller
                }],
                data: {
                    msgid: 'testdatanotsorandommsgidfrom_generateListingItems',
                    version: '0300',
                    received: new Date().toISOString(),
                    sent: new Date().toISOString(),
                    from: fromAddress,
                    to: listingItemCreateRequest.seller
                }
            }];

            const savedListingItemModel = await this.listingItemService.create(listingItemCreateRequest);

            // this.log.debug('savedListingItem: ', savedListingItem.toJSON());
            const result = savedListingItemModel.toJSON();
            items.push(result);

        }
        // this.log.debug('items: ', items);

        return await this.generateResponse(items, withRelated);
    }

    // -------------------
    // bids
    private async generateBids(
        amount: number, withRelated: boolean = true, generateParams: GenerateBidParams):
    Promise<resources.Bid[]> {

        this.log.debug('generateBids, generateParams: ', generateParams);

        const listingItemTemplateGenerateParams = new GenerateListingItemTemplateParams();
        const listingItemGenerateParams = new GenerateListingItemParams();

        let listingItemTemplate: resources.ListingItemTemplate;
        let listingItem: resources.ListingItem;

        // generate template
        if (generateParams.generateListingItemTemplate) {
            const listingItemTemplates = await this.generateListingItemTemplates(1, true, listingItemTemplateGenerateParams);
            listingItemTemplate = listingItemTemplates[0];

            this.log.debug('templates generated:', listingItemTemplates.length);
            this.log.debug('listingItemTemplates[0].id:', listingItemTemplates[0].id);
            this.log.debug('listingItemTemplates[0].hash:', listingItemTemplates[0].hash);

            // set the hash for listing item generation
            listingItemGenerateParams.listingItemTemplateHash = listingItemTemplates[0].hash;
        }

        // generate item
        if (generateParams.generateListingItem) {

            // set the seller for listing item generation
            listingItemGenerateParams.seller = generateParams.listingItemSeller ? generateParams.listingItemSeller : null;

            this.log.debug('listingItemGenerateParams:', listingItemGenerateParams);

            const listingItems = await this.generateListingItems(1, true, listingItemGenerateParams);
            listingItem = listingItems[0];

            this.log.debug('items generated:', listingItems.length);
            this.log.debug('listingItem.id:', listingItem.id);
            this.log.debug('listingItem.hash:', listingItem.hash);

            // set the hash for bid generation
            generateParams.listingItemHash = listingItem.hash;
        }

        this.log.debug('generateParams:', generateParams);

        const items: resources.Bid[] = [];
        for (let i = amount; i > 0; i--) {
            const bid = await this.generateBidData(generateParams);
            const savedBidModel = await this.bidService.create(bid);
            const result = savedBidModel.toJSON();
            items.push(result);
        }
        return this.generateResponse(items, withRelated);
    }

    private async generateBidData(generateParams: GenerateBidParams): Promise<BidCreateRequest> {

        const addresses = await this.generateAddressesData(1);
        // this.log.debug('Generated addresses = ' + JSON.stringify(addresses, null, 2));
        const address = addresses[0];

        // TODO: defaultProfile might not be the correct one
        const defaultProfile = await this.profileService.getDefault();
        address.profile_id = defaultProfile.Id;

        const bidder = generateParams.bidder ? generateParams.bidder : await this.coreRpcService.getNewAddress();
        const action = generateParams.action ? generateParams.action : BidMessageType.MPA_BID;

        // TODO: generate biddatas
        const bidDatas: BidDataCreateRequest[] = [];

        const bidCreateRequest = {
            action,
            address,
            bidder,
            bidDatas
        } as BidCreateRequest;
        // this.log.debug('Generated bid = ' + JSON.stringify(retval, null, 2));

        // if we have a hash, fetch the listingItem and set the relation
        if (generateParams.listingItemHash) {
            const listingItemModel = await this.listingItemService.findOneByHash(generateParams.listingItemHash);
            const listingItem = listingItemModel ? listingItemModel.toJSON() : null;
            if (listingItem) {
                bidCreateRequest.listing_item_id = listingItem.id;
            }
        }

        return bidCreateRequest;
    }

    // -------------------
    // orders
    private async generateOrders(
        amount: number, withRelated: boolean = true, generateParams: GenerateOrderParams):
    Promise<resources.Order[]> {

        const items: resources.Order[] = [];
        for (let i = amount; i > 0; i--) {
            const order = await this.generateOrderData(generateParams);
            const savedOrderModel = await this.orderService.create(order);
            const result = savedOrderModel.toJSON();
            items.push(result);
        }
        return this.generateResponse(items, withRelated);
    }

    private async generateOrderData(generateParams: GenerateOrderParams): Promise<OrderCreateRequest> {
        // todo: add GenerateListingItemParams and GenerateBidParams inside generateOrderParams

        const bidGenerateParams = new GenerateBidParams();

        //  generate bid which will also create a ListingItem
        const bids = await this.generateBids(1, true, bidGenerateParams);
        const bidId = bids[0].id;
        const listingItemId = bids[0].ListingItem.id;

        this.log.debug(`generateOrderData: generated new listing with id ${listingItemId}, continuing order creation`);
        this.log.debug(`generateOrderData: generated new bid with id ${bidId}, continuing order creation`);

        // TODO: then generate order with some orderitems and orderitemobjects
        const orderItemCreateRequest = await this.generateOrderItemData(bids[0]);
        const hash = Faker.random.uuid();
        const buyer = Faker.finance.bitcoinAddress();
        const seller = Faker.finance.bitcoinAddress();

        return {
            address_id: listingItemId,
            hash,
            orderItems: [orderItemCreateRequest],
            buyer,
            seller
        } as OrderCreateRequest;
    }

    private async generateOrderItemData(bid: resources.Bid): Promise<OrderItemCreateRequest> {
        const orderItemObjects: OrderItemObjectCreateRequest[] = [];
        return {
            order_id: 0,
            itemHash: bid.ListingItem.hash,
            bid_id: bid.id,
            status: OrderStatus.AWAITING_ESCROW,
            orderItemObjects
        } as OrderItemCreateRequest;
    }

    // -------------------
    // profiles

    private async generateProfiles(
        amount: number, withRelated: boolean = true, generateParams: GenerateProfileParams):
    Promise<resources.Profile[]> {

        const items: resources.Profile[] = [];
        for (let i = amount; i > 0; i--) {
            const profile = await this.generateProfileData(generateParams);
            const savedProfileModel = await this.profileService.create(profile);
            const result = savedProfileModel.toJSON();
            items.push(result);
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

    private async generateProfileData(generateParams: GenerateProfileParams): Promise<ProfileCreateRequest> {
        const name = 'TEST-' + Faker.name.firstName();
        const address = await this.coreRpcService.getNewAddress();

        this.log.debug('generateParams.generateShippingAddresses: ', generateParams.generateShippingAddresses);
        this.log.debug('generateParams.generateCryptocurrencyAddresses: ', generateParams.generateCryptocurrencyAddresses);
        const profile = await this.generateAddressesData(_.random(1, 5));
        const shippingAddresses = generateParams.generateShippingAddresses ? profile : [];
        const cryptocurrencyAddresses = generateParams.generateCryptocurrencyAddresses ? await this.generateCryptocurrencyAddressesData(_.random(1, 5)) : [];

        return {
            name,
            address,
            shippingAddresses,
            cryptocurrencyAddresses
        } as ProfileCreateRequest;
    }

    private async generateAddressesData(amount: number): Promise<AddressCreateRequest[]> {
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
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                type: AddressType.SHIPPING_OWN
            });
        }
        return addresses;
    }

    private async generateCryptocurrencyAddressesData(amount: number): Promise<CryptocurrencyAddressCreateRequest[]> {
        const cryptoAddresses: any[] = [];
        for (let i = amount; i > 0; i--) {
            cryptoAddresses.push({
                type: Faker.random.arrayElement(Object.getOwnPropertyNames(CryptocurrencyAddressType)),
                address: await this.coreRpcService.getNewAddress()
            });
        }
        return cryptoAddresses;
    }

    private async generateListingItemData(generateParams: GenerateListingItemParams): Promise<ListingItemCreateRequest> {

        // get default profile
        const defaultProfileModel = await this.profileService.getDefault();
        const defaultProfile = defaultProfileModel.toJSON();

        // get default market
        const defaultMarketModel = await this.marketService.getDefault();
        const defaultMarket = defaultMarketModel.toJSON();

        // set seller to given address or get a new one
        const seller = generateParams.seller ? generateParams.seller : await this.coreRpcService.getNewAddress();

        const itemInformation = generateParams.generateItemInformation ? this.generateItemInformationData(generateParams) : {};
        const paymentInformation = generateParams.generatePaymentInformation ? await this.generatePaymentInformationData(generateParams) : {};
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];

        const listingItemCreateRequest = {
            seller,
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            market_id: defaultMarket.id
        } as ListingItemCreateRequest;

        // fetch listingItemTemplate if hash was given
        let listingItemTemplate: resources.ListingItemTemplate | null = null;
        if (generateParams.listingItemTemplateHash) {
            const listingItemTemplateModel = await this.listingItemTemplateService.findOneByHash(generateParams.listingItemTemplateHash);
            listingItemTemplate = listingItemTemplateModel ? listingItemTemplateModel.toJSON() : null;
            if (listingItemTemplate) {
                listingItemCreateRequest.listing_item_template_id = listingItemTemplate.id;
            }
        }

        return listingItemCreateRequest;
    }

    private generateShippingDestinationsData(amount: number): any[] {
        const items: any[] = [];
        for (let i = amount; i > 0; i--) {
            items.push({
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
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
                region: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
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

    private async generatePaymentInformationData(generateParams: GenerateListingItemTemplateParams): Promise<PaymentInformationCreateRequest> {

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
                    address: await this.coreRpcService.getNewAddress()
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

    // listingitemobjects
    private generateListingItemObjectsData(generateParams: GenerateListingItemTemplateParams): any {
        const listingItemObjectDatas = generateParams.generateObjectDatas
            ? this.generateObjectDataData(_.random(1, 5))
            : [];

        const listingItemObjects = [{
            type: Faker.random.arrayElement(Object.getOwnPropertyNames(ListingItemObjectType)),
            description: Faker.lorem.paragraph(),
            order: Faker.random.number(),
            listingItemObjectDatas
        }];
        return listingItemObjects;
    }

    private generateObjectDataData(amount: number): any[] {
        const object: any[] = [];
        for (let i = amount; i > 0; i--) {
            object.push({
                key: Faker.lorem.slug(),
                value: Faker.lorem.word()
            });
        }
        return object;
    }

    private async generateListingItemTemplateData(generateParams: GenerateListingItemTemplateParams): Promise<ListingItemTemplateCreateRequest> {
        const itemInformation = generateParams.generateItemInformation ? this.generateItemInformationData(generateParams) : {};
        const paymentInformation = generateParams.generatePaymentInformation ? await this.generatePaymentInformationData(generateParams) : {};
        const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
        const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];

        const defaultProfile = await this.profileService.getDefault();

        const listingItemTemplateCreateRequest = {
            itemInformation,
            paymentInformation,
            messagingInformation,
            listingItemObjects,
            profile_id: defaultProfile.Id
        } as ListingItemTemplateCreateRequest;

        // this.log.debug('listingItemTemplateCreateRequest', JSON.stringify(listingItemTemplateCreateRequest, null, 2));
        return listingItemTemplateCreateRequest;
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
