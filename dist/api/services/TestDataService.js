"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const Database_1 = require("../../config/Database");
const inversify_1 = require("inversify");
const Validate_1 = require("../../core/api/Validate");
const constants_1 = require("../../constants");
const _ = require("lodash");
const Faker = require("faker");
const MessageException_1 = require("../exceptions/MessageException");
const TestDataCreateRequest_1 = require("../requests/TestDataCreateRequest");
const ShippingCountries_1 = require("../../core/helpers/ShippingCountries");
const ShippingAvailability_1 = require("../enums/ShippingAvailability");
const MessagingProtocolType_1 = require("../enums/MessagingProtocolType");
const CryptocurrencyAddressType_1 = require("../enums/CryptocurrencyAddressType");
const ListingItemObjectType_1 = require("../enums/ListingItemObjectType");
const Currency_1 = require("../enums/Currency");
const ImageDataProtocolType_1 = require("../enums/ImageDataProtocolType");
const PaymentType_1 = require("../enums/PaymentType");
const EscrowType_1 = require("../enums/EscrowType");
const ListingItemService_1 = require("./ListingItemService");
const ListingItemTemplateService_1 = require("./ListingItemTemplateService");
const DefaultItemCategoryService_1 = require("./DefaultItemCategoryService");
const DefaultProfileService_1 = require("./DefaultProfileService");
const DefaultMarketService_1 = require("./DefaultMarketService");
const ProfileService_1 = require("./ProfileService");
const MarketService_1 = require("./MarketService");
const ItemCategoryService_1 = require("./ItemCategoryService");
const FavoriteItemService_1 = require("./FavoriteItemService");
const ItemInformationService_1 = require("./ItemInformationService");
const BidService_1 = require("./BidService");
const PaymentInformationService_1 = require("./PaymentInformationService");
const ItemImageService_1 = require("./ItemImageService");
const ActionMessageService_1 = require("./ActionMessageService");
const TestDataGenerateRequest_1 = require("../requests/TestDataGenerateRequest");
const CreatableModel_1 = require("../enums/CreatableModel");
const GenerateListingItemTemplateParams_1 = require("../requests/params/GenerateListingItemTemplateParams");
const GenerateListingItemParams_1 = require("../requests/params/GenerateListingItemParams");
const GenerateProfileParams_1 = require("../requests/params/GenerateProfileParams");
const GenerateBidParams_1 = require("../requests/params/GenerateBidParams");
const ImageProcessing_1 = require("../../core/helpers/ImageProcessing");
const BidMessageType_1 = require("../enums/BidMessageType");
const AddressType_1 = require("../enums/AddressType");
const ListingItemMessageType_1 = require("../enums/ListingItemMessageType");
const CoreRpcService_1 = require("./CoreRpcService");
const GenerateOrderParams_1 = require("../requests/params/GenerateOrderParams");
const OrderService_1 = require("./OrderService");
const OrderFactory_1 = require("../factories/OrderFactory");
let TestDataService = class TestDataService {
    constructor(defaultItemCategoryService, defaultProfileService, defaultMarketService, marketService, profileService, listingItemTemplateService, listingItemService, itemCategoryService, favoriteItemService, itemInformationService, bidService, orderService, itemImageService, paymentInformationService, actionMessageService, coreRpcService, orderFactory, Logger) {
        this.defaultItemCategoryService = defaultItemCategoryService;
        this.defaultProfileService = defaultProfileService;
        this.defaultMarketService = defaultMarketService;
        this.marketService = marketService;
        this.profileService = profileService;
        this.listingItemTemplateService = listingItemTemplateService;
        this.listingItemService = listingItemService;
        this.itemCategoryService = itemCategoryService;
        this.favoriteItemService = favoriteItemService;
        this.itemInformationService = itemInformationService;
        this.bidService = bidService;
        this.orderService = orderService;
        this.itemImageService = itemImageService;
        this.paymentInformationService = paymentInformationService;
        this.actionMessageService = actionMessageService;
        this.coreRpcService = coreRpcService;
        this.orderFactory = orderFactory;
        this.Logger = Logger;
        this.ignoreTables = ['sqlite_sequence', 'version', 'version_lock', 'knex_migrations', 'knex_migrations_lock'];
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
    clean(seed = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            yield this.cleanDb();
            if (seed) {
                this.log.debug('seeding default data after cleaning');
                yield this.defaultItemCategoryService.seedDefaultCategories();
                yield this.defaultProfileService.seedDefaultProfile();
                yield this.defaultMarketService.seedDefaultMarket();
                this.log.info('cleanup & default seeds done.');
                return;
            }
        });
    }
    /**
     * creates testdata from json
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    create(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            switch (body.model) {
                case CreatableModel_1.CreatableModel.LISTINGITEMTEMPLATE: {
                    return yield this.listingItemTemplateService.create(body.data, body.timestampedHash);
                }
                case CreatableModel_1.CreatableModel.LISTINGITEM: {
                    return yield this.listingItemService.create(body.data);
                }
                case CreatableModel_1.CreatableModel.ACTIONMESSAGE: {
                    return yield this.actionMessageService.create(body.data);
                }
                case CreatableModel_1.CreatableModel.PROFILE: {
                    return yield this.profileService.create(body.data);
                }
                case CreatableModel_1.CreatableModel.ITEMCATEGORY: {
                    return yield this.itemCategoryService.create(body.data);
                }
                case CreatableModel_1.CreatableModel.FAVORITEITEM: {
                    return yield this.favoriteItemService.create(body.data);
                }
                case CreatableModel_1.CreatableModel.ITEMINFORMATION: {
                    return yield this.itemInformationService.create(body.data);
                }
                case CreatableModel_1.CreatableModel.BID: {
                    return yield this.bidService.create(body.data);
                }
                case CreatableModel_1.CreatableModel.PAYMENTINFORMATION: {
                    return yield this.paymentInformationService.create(body.data);
                }
                case CreatableModel_1.CreatableModel.ITEMIMAGE: {
                    return yield this.itemImageService.create(body.data);
                }
                default: {
                    throw new MessageException_1.MessageException('Not implemented');
                }
            }
        });
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
    generate(body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            switch (body.model) {
                case CreatableModel_1.CreatableModel.LISTINGITEMTEMPLATE: {
                    const generateParams = new GenerateListingItemTemplateParams_1.GenerateListingItemTemplateParams(body.generateParams);
                    return yield this.generateListingItemTemplates(body.amount, body.withRelated, generateParams);
                }
                case CreatableModel_1.CreatableModel.LISTINGITEM: {
                    const generateParams = new GenerateListingItemParams_1.GenerateListingItemParams(body.generateParams);
                    return yield this.generateListingItems(body.amount, body.withRelated, generateParams);
                }
                case CreatableModel_1.CreatableModel.PROFILE: {
                    const generateParams = new GenerateProfileParams_1.GenerateProfileParams(body.generateParams);
                    return yield this.generateProfiles(body.amount, body.withRelated, generateParams);
                }
                case CreatableModel_1.CreatableModel.BID: {
                    const generateParams = new GenerateBidParams_1.GenerateBidParams(body.generateParams);
                    return yield this.generateBids(body.amount, body.withRelated, generateParams);
                }
                case CreatableModel_1.CreatableModel.ORDER: {
                    const generateParams = new GenerateOrderParams_1.GenerateOrderParams(body.generateParams);
                    return yield this.generateOrders(body.amount, body.withRelated, generateParams);
                }
                default: {
                    throw new MessageException_1.MessageException('Not implemented');
                }
            }
        });
    }
    /**
     * clean up the db
     *
     * @returns {Promise<void>}
     */
    cleanDb() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
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
                'users',
                'price_ticker',
                'flagged_items',
                'currency_prices'
            ];
            for (const table of tablesToClean) {
                // this.log.debug('cleaning table: ', table);
                yield Database_1.Bookshelf.knex.select().from(table).del();
            }
            return;
        });
    }
    getTableNames(knex) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield knex.raw("SELECT name FROM sqlite_master WHERE type='table';");
        });
    }
    // -------------------
    // listingitemtemplates
    generateListingItemTemplates(amount, withRelated = true, generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const items = [];
            for (let i = amount; i > 0; i--) {
                const listingItemTemplateCreateRequest = yield this.generateListingItemTemplateData(generateParams);
                let listingItemTemplateModel = yield this.listingItemTemplateService.create(listingItemTemplateCreateRequest);
                let result = listingItemTemplateModel.toJSON();
                // generate a ListingItem with the same data
                if (generateParams.generateListingItem) {
                    let market;
                    if (generateParams.marketId === null) {
                        const marketModel = yield this.marketService.getDefault();
                        market = marketModel.toJSON();
                    }
                    else {
                        const marketModel = yield this.marketService.findOne(generateParams.marketId);
                        market = marketModel.toJSON();
                    }
                    // add ActionMessage
                    const actionMessages = [{
                            action: ListingItemMessageType_1.ListingItemMessageType.MP_ITEM_ADD,
                            objects: [{
                                    dataId: 'seller',
                                    dataValue: result.Profile.address
                                }],
                            data: {
                                msgid: 'testdatanotsorandommsgidfrom_generateListingItems',
                                version: '0300',
                                received: new Date().toISOString(),
                                sent: new Date().toISOString(),
                                from: result.Profile.address,
                                to: market.address
                            }
                        }];
                    const listingItemCreateRequest = {
                        seller: result.Profile.address,
                        market_id: market.id,
                        listing_item_template_id: result.id,
                        itemInformation: listingItemTemplateCreateRequest.itemInformation,
                        paymentInformation: listingItemTemplateCreateRequest.paymentInformation,
                        messagingInformation: listingItemTemplateCreateRequest.messagingInformation,
                        listingItemObjects: listingItemTemplateCreateRequest.listingItemObjects,
                        actionMessages
                    };
                    const listingItemModel = yield this.listingItemService.create(listingItemCreateRequest);
                    const listingItem = listingItemModel.toJSON();
                    // fetch new relation
                    listingItemTemplateModel = yield this.listingItemTemplateService.findOne(result.id);
                    result = listingItemTemplateModel.toJSON();
                }
                items.push(result);
            }
            return this.generateResponse(items, withRelated);
        });
    }
    // -------------------
    // listingitems
    generateListingItems(amount, withRelated = true, generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const items = [];
            for (let i = amount; i > 0; i--) {
                const listingItemCreateRequest = yield this.generateListingItemData(generateParams);
                // TODO: actionmessage generation should be configurable
                // const fromAddress = await this.coreRpcService.getNewAddress();
                const marketModel = yield this.marketService.getDefault();
                const market = marketModel.toJSON();
                // add ActionMessage
                listingItemCreateRequest.actionMessages = [{
                        action: ListingItemMessageType_1.ListingItemMessageType.MP_ITEM_ADD,
                        objects: [{
                                dataId: 'seller',
                                dataValue: listingItemCreateRequest.seller
                            }],
                        data: {
                            msgid: 'testdatanotsorandommsgidfrom_generateListingItems',
                            version: '0300',
                            received: new Date().toISOString(),
                            sent: new Date().toISOString(),
                            from: listingItemCreateRequest.seller,
                            to: market.address
                        }
                    }];
                const savedListingItemModel = yield this.listingItemService.create(listingItemCreateRequest);
                // this.log.debug('savedListingItem: ', savedListingItem.toJSON());
                const result = savedListingItemModel.toJSON();
                items.push(result);
            }
            // this.log.debug('items: ', items);
            return yield this.generateResponse(items, withRelated);
        });
    }
    // -------------------
    // bids
    generateBids(amount, withRelated = true, generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('generateBids, generateParams: ', generateParams);
            const listingItemTemplateGenerateParams = new GenerateListingItemTemplateParams_1.GenerateListingItemTemplateParams();
            const listingItemGenerateParams = new GenerateListingItemParams_1.GenerateListingItemParams();
            let listingItemTemplate;
            let listingItem;
            // generate template
            if (generateParams.generateListingItemTemplate) {
                const listingItemTemplates = yield this.generateListingItemTemplates(1, true, listingItemTemplateGenerateParams);
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
                const listingItems = yield this.generateListingItems(1, true, listingItemGenerateParams);
                listingItem = listingItems[0];
                this.log.debug('listingItems generated:', listingItems.length);
                this.log.debug('listingItem.id:', listingItem.id);
                this.log.debug('listingItem.hash:', listingItem.hash);
                // set the hash for bid generation
                generateParams.listingItemHash = listingItem.hash;
            }
            this.log.debug('generateParams:', generateParams);
            const items = [];
            for (let i = amount; i > 0; i--) {
                const bid = yield this.generateBidData(generateParams);
                const savedBidModel = yield this.bidService.create(bid);
                const result = savedBidModel.toJSON();
                items.push(result);
            }
            return this.generateResponse(items, withRelated);
        });
    }
    generateBidData(generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const addresses = yield this.generateAddressesData(1);
            // this.log.debug('Generated addresses = ' + JSON.stringify(addresses, null, 2));
            const address = addresses[0];
            // TODO: defaultProfile might not be the correct one
            const defaultProfile = yield this.profileService.getDefault();
            address.profile_id = defaultProfile.Id;
            const bidder = generateParams.bidder ? generateParams.bidder : yield this.coreRpcService.getNewAddress();
            const action = generateParams.action ? generateParams.action : BidMessageType_1.BidMessageType.MPA_BID;
            // TODO: generate biddatas
            const bidDatas = [];
            const bidCreateRequest = {
                action,
                address,
                bidder,
                bidDatas
            };
            // this.log.debug('Generated bid = ' + JSON.stringify(retval, null, 2));
            // if we have a hash, fetch the listingItem and set the relation
            if (generateParams.listingItemHash) {
                const listingItemModel = yield this.listingItemService.findOneByHash(generateParams.listingItemHash);
                const listingItem = listingItemModel ? listingItemModel.toJSON() : null;
                if (listingItem) {
                    bidCreateRequest.listing_item_id = listingItem.id;
                }
            }
            return bidCreateRequest;
        });
    }
    // -------------------
    // orders
    generateOrders(amount, withRelated = true, generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.log.debug('generateOrders, generateParams: ', generateParams);
            // const listingItemTemplateGenerateParams = new GenerateListingItemTemplateParams();
            // const listingItemGenerateParams = new GenerateListingItemParams();
            const bidGenerateParams = new GenerateBidParams_1.GenerateBidParams();
            // let listingItemTemplate: resources.ListingItemTemplate;
            // let listingItem: resources.ListingItem;
            /*
                    // generate template
                    if (generateParams.generateListingItemTemplate) {
                        const listingItemTemplates = await this.generateListingItemTemplates(1, true, listingItemTemplateGenerateParams);
                        listingItemTemplate = listingItemTemplates[0];
            
                        this.log.debug('templates generated:', listingItemTemplates.length);
                        this.log.debug('listingItemTemplates[0].id:', listingItemTemplates[0].id);
                        this.log.debug('listingItemTemplates[0].hash:', listingItemTemplates[0].hash);
            
                        // set the hash for listing item generation
                        listingItemGenerateParams.listingItemTemplateHash = listingItemTemplates[0].hash;
                    } else {
                        listingItemTemplate = {} as resources.ListingItemTemplate;
                    }
            
                    // generate listingitem
                    if (generateParams.generateListingItem) {
            
                        // set the seller for listing item generation
                        listingItemGenerateParams.seller = generateParams.listingItemSeller ? generateParams.listingItemSeller : null;
            
                        this.log.debug('listingItemGenerateParams:', listingItemGenerateParams);
            
                        const listingItems = await this.generateListingItems(1, true, listingItemGenerateParams);
                        listingItem = listingItems[0];
            
                        this.log.debug('listingItems generated:', listingItems.length);
                        this.log.debug('listingItem.id:', listingItem.id);
                        this.log.debug('listingItem.hash:', listingItem.hash);
            
                        // set the hash for bid generation
                        bidGenerateParams.listingItemHash = listingItem.hash;
                    } else {
                        listingItem = {} as resources.ListingItem;
                    }
            */
            let bid;
            // generate bid
            if (generateParams.generateBid) {
                bidGenerateParams.generateListingItemTemplate = generateParams.generateListingItemTemplate;
                bidGenerateParams.generateListingItem = generateParams.generateListingItem;
                bidGenerateParams.action = BidMessageType_1.BidMessageType.MPA_ACCEPT;
                bidGenerateParams.listingItemSeller = generateParams.listingItemSeller;
                const bids = yield this.generateBids(1, true, bidGenerateParams);
                bid = bids[0];
                this.log.debug('bids generated:', bids.length);
                this.log.debug('bid.id:', bid.id);
                // set the bid_id for order generation
                generateParams.bidId = bid.id;
            }
            else {
                bid = {};
            }
            this.log.debug('bid:', JSON.stringify(bid, null, 2));
            // wtf why are the objects allready?
            const listingItemTemplateModel = yield this.listingItemTemplateService.findOne(bid.ListingItem.ListingItemTemplate.id);
            const listingItemModel = yield this.listingItemService.findOne(bid.ListingItem.id);
            const listingItemTemplate = listingItemTemplateModel.toJSON();
            const listingItem = listingItemModel.toJSON();
            this.log.debug('bid.ListingItem.ListingItemTemplate.id:', bid.ListingItem.ListingItemTemplate.id);
            this.log.debug('listingItemTemplate.id:', listingItemTemplate.id);
            this.log.debug('listingItem.id:', listingItem.id);
            this.log.debug('listingItem.seller:', listingItem.seller);
            this.log.debug('bid.bidder:', bid.bidder);
            // this.log.debug('listingItemTemplate:', JSON.stringify(listingItemTemplate, null, 2));
            // this.log.debug('listingItem:', JSON.stringify(listingItem, null, 2));
            const items = [];
            for (let i = amount; i > 0; i--) {
                const orderCreateRequest = yield this.generateOrderData(generateParams);
                this.log.debug('orderCreateRequest:', JSON.stringify(orderCreateRequest, null, 2));
                const savedOrderModel = yield this.orderService.create(orderCreateRequest);
                const result = savedOrderModel.toJSON();
                items.push(result);
            }
            return this.generateResponse(items, withRelated);
        });
    }
    generateOrderData(generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // get the bid
            const bidModel = yield this.bidService.findOne(generateParams.bidId);
            const bid = bidModel.toJSON();
            // then generate ordercreaterequest with some orderitems and orderitemobjects
            const orderCreateRequest = yield this.orderFactory.getModelFromBid(bid);
            return orderCreateRequest;
        });
    }
    /*
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
    */
    // -------------------
    // profiles
    generateProfiles(amount, withRelated = true, generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const items = [];
            for (let i = amount; i > 0; i--) {
                const profile = yield this.generateProfileData(generateParams);
                const savedProfileModel = yield this.profileService.create(profile);
                const result = savedProfileModel.toJSON();
                items.push(result);
            }
            return this.generateResponse(items, withRelated);
        });
    }
    generateResponse(items, withRelated) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (withRelated) {
                return items;
            }
            else {
                return yield items.map(item => item.id);
            }
        });
    }
    generateProfileData(generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const name = 'TEST-' + Faker.name.firstName();
            const address = yield this.coreRpcService.getNewAddress();
            this.log.debug('generateParams.generateShippingAddresses: ', generateParams.generateShippingAddresses);
            this.log.debug('generateParams.generateCryptocurrencyAddresses: ', generateParams.generateCryptocurrencyAddresses);
            const profile = yield this.generateAddressesData(_.random(1, 5));
            const shippingAddresses = generateParams.generateShippingAddresses ? profile : [];
            const cryptocurrencyAddresses = generateParams.generateCryptocurrencyAddresses ? yield this.generateCryptocurrencyAddressesData(_.random(1, 5)) : [];
            return {
                name,
                address,
                shippingAddresses,
                cryptocurrencyAddresses
            };
        });
    }
    generateAddressesData(amount) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const addresses = [];
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
                    country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries_1.ShippingCountries.countryCodeList)),
                    type: AddressType_1.AddressType.SHIPPING_OWN
                });
            }
            return addresses;
        });
    }
    generateCryptocurrencyAddressesData(amount) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const cryptoAddresses = [];
            for (let i = amount; i > 0; i--) {
                cryptoAddresses.push({
                    type: Faker.random.arrayElement(Object.getOwnPropertyNames(CryptocurrencyAddressType_1.CryptocurrencyAddressType)),
                    address: yield this.coreRpcService.getNewAddress()
                });
            }
            return cryptoAddresses;
        });
    }
    generateListingItemData(generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // get default profile
            const defaultProfileModel = yield this.profileService.getDefault();
            const defaultProfile = defaultProfileModel.toJSON();
            // get default market
            const defaultMarketModel = yield this.marketService.getDefault();
            const defaultMarket = defaultMarketModel.toJSON();
            // set seller to given address or get a new one
            const seller = generateParams.seller ? generateParams.seller : yield this.coreRpcService.getNewAddress();
            const itemInformation = generateParams.generateItemInformation ? this.generateItemInformationData(generateParams) : {};
            const paymentInformation = generateParams.generatePaymentInformation ? yield this.generatePaymentInformationData(generateParams) : {};
            const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
            const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];
            const listingItemCreateRequest = {
                seller,
                itemInformation,
                paymentInformation,
                messagingInformation,
                listingItemObjects,
                market_id: defaultMarket.id
            };
            // fetch listingItemTemplate if hash was given and set the listing_item_template_id
            let listingItemTemplate = null;
            if (generateParams.listingItemTemplateHash) {
                const listingItemTemplateModel = yield this.listingItemTemplateService.findOneByHash(generateParams.listingItemTemplateHash);
                listingItemTemplate = listingItemTemplateModel ? listingItemTemplateModel.toJSON() : null;
                if (listingItemTemplate) {
                    listingItemCreateRequest.listing_item_template_id = listingItemTemplate.id;
                }
            }
            return listingItemCreateRequest;
        });
    }
    generateShippingDestinationsData(amount) {
        const items = [];
        for (let i = amount; i > 0; i--) {
            items.push({
                country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries_1.ShippingCountries.countryCodeList)),
                shippingAvailability: ShippingAvailability_1.ShippingAvailability.SHIPS
            });
        }
        return items;
    }
    generateItemImagesData(amount) {
        const items = [];
        for (let i = amount; i > 0; i--) {
            const item = {
                hash: Faker.random.uuid(),
                data: [{
                        dataId: Faker.internet.url(),
                        protocol: ImageDataProtocolType_1.ImageDataProtocolType.LOCAL,
                        imageVersion: 'ORIGINAL',
                        encoding: 'BASE64',
                        data: ImageProcessing_1.ImageProcessing.milkcatSmall
                    }]
            };
            items.push(item);
        }
        return items;
    }
    generateItemInformationData(generateParams) {
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
                region: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries_1.ShippingCountries.countryCodeList)),
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
    generatePaymentInformationData(generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const escrow = generateParams.generateEscrow
                ? {
                    type: EscrowType_1.EscrowType.MAD.toString(),
                    ratio: {
                        buyer: _.random(1, 100),
                        seller: _.random(1, 100)
                    }
                }
                : {};
            const itemPrice = generateParams.generateItemPrice
                ? {
                    currency: Currency_1.Currency.PARTICL.toString(),
                    basePrice: _.random(0.1, 1.00),
                    shippingPrice: {
                        domestic: _.random(0.01, 0.10),
                        international: _.random(0.10, 0.20)
                    },
                    cryptocurrencyAddress: {
                        type: Faker.random.arrayElement(Object.getOwnPropertyNames(CryptocurrencyAddressType_1.CryptocurrencyAddressType)),
                        address: yield this.coreRpcService.getNewAddress()
                    }
                }
                : {};
            const paymentInformation = {
                type: PaymentType_1.PaymentType.SALE.toString(),
                escrow,
                itemPrice
            };
            return paymentInformation;
        });
    }
    // TODO: type
    generateMessagingInformationData() {
        const messagingInformation = [{
                protocol: Faker.random.arrayElement(Object.getOwnPropertyNames(MessagingProtocolType_1.MessagingProtocolType)),
                publicKey: Faker.random.uuid()
            }];
        return messagingInformation;
    }
    // listingitemobjects
    generateListingItemObjectsData(generateParams) {
        const listingItemObjectDatas = generateParams.generateObjectDatas
            ? this.generateObjectDataData(_.random(1, 5))
            : [];
        const listingItemObjects = [{
                type: Faker.random.arrayElement(Object.getOwnPropertyNames(ListingItemObjectType_1.ListingItemObjectType)),
                description: Faker.lorem.paragraph(),
                order: Faker.random.number(),
                listingItemObjectDatas
            }];
        return listingItemObjects;
    }
    // TODO: type
    generateObjectDataData(amount) {
        const object = [];
        for (let i = amount; i > 0; i--) {
            object.push({
                key: Faker.lorem.slug(),
                value: Faker.lorem.word()
            });
        }
        return object;
    }
    generateListingItemTemplateData(generateParams) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const itemInformation = generateParams.generateItemInformation ? this.generateItemInformationData(generateParams) : {};
            const paymentInformation = generateParams.generatePaymentInformation ? yield this.generatePaymentInformationData(generateParams) : {};
            const messagingInformation = generateParams.generateMessagingInformation ? this.generateMessagingInformationData() : [];
            const listingItemObjects = generateParams.generateListingItemObjects ? this.generateListingItemObjectsData(generateParams) : [];
            let profile;
            if (generateParams.profileId === null) {
                const profileModel = yield this.profileService.getDefault();
                profile = profileModel.toJSON();
            }
            else {
                const profileModel = yield this.profileService.findOne(generateParams.profileId);
                profile = profileModel.toJSON();
            }
            const listingItemTemplateCreateRequest = {
                itemInformation,
                paymentInformation,
                messagingInformation,
                listingItemObjects,
                profile_id: profile.id
            };
            // this.log.debug('listingItemTemplateCreateRequest', JSON.stringify(listingItemTemplateCreateRequest, null, 2));
            return listingItemTemplateCreateRequest;
        });
    }
    randomCategoryKey() {
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
};
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(TestDataCreateRequest_1.TestDataCreateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [TestDataCreateRequest_1.TestDataCreateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], TestDataService.prototype, "create", null);
tslib_1.__decorate([
    Validate_1.validate(),
    tslib_1.__param(0, Validate_1.request(TestDataGenerateRequest_1.TestDataGenerateRequest)),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [TestDataGenerateRequest_1.TestDataGenerateRequest]),
    tslib_1.__metadata("design:returntype", Promise)
], TestDataService.prototype, "generate", null);
TestDataService = tslib_1.__decorate([
    tslib_1.__param(0, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(0, inversify_1.named(constants_1.Targets.Service.DefaultItemCategoryService)),
    tslib_1.__param(1, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(1, inversify_1.named(constants_1.Targets.Service.DefaultProfileService)),
    tslib_1.__param(2, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(2, inversify_1.named(constants_1.Targets.Service.DefaultMarketService)),
    tslib_1.__param(3, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(3, inversify_1.named(constants_1.Targets.Service.MarketService)),
    tslib_1.__param(4, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(4, inversify_1.named(constants_1.Targets.Service.ProfileService)),
    tslib_1.__param(5, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(5, inversify_1.named(constants_1.Targets.Service.ListingItemTemplateService)),
    tslib_1.__param(6, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(6, inversify_1.named(constants_1.Targets.Service.ListingItemService)),
    tslib_1.__param(7, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(7, inversify_1.named(constants_1.Targets.Service.ItemCategoryService)),
    tslib_1.__param(8, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(8, inversify_1.named(constants_1.Targets.Service.FavoriteItemService)),
    tslib_1.__param(9, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(9, inversify_1.named(constants_1.Targets.Service.ItemInformationService)),
    tslib_1.__param(10, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(10, inversify_1.named(constants_1.Targets.Service.BidService)),
    tslib_1.__param(11, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(11, inversify_1.named(constants_1.Targets.Service.OrderService)),
    tslib_1.__param(12, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(12, inversify_1.named(constants_1.Targets.Service.ItemImageService)),
    tslib_1.__param(13, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(13, inversify_1.named(constants_1.Targets.Service.PaymentInformationService)),
    tslib_1.__param(14, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(14, inversify_1.named(constants_1.Targets.Service.ActionMessageService)),
    tslib_1.__param(15, inversify_1.inject(constants_1.Types.Service)), tslib_1.__param(15, inversify_1.named(constants_1.Targets.Service.CoreRpcService)),
    tslib_1.__param(16, inversify_1.inject(constants_1.Types.Factory)), tslib_1.__param(16, inversify_1.named(constants_1.Targets.Factory.OrderFactory)),
    tslib_1.__param(17, inversify_1.inject(constants_1.Types.Core)), tslib_1.__param(17, inversify_1.named(constants_1.Core.Logger)),
    tslib_1.__metadata("design:paramtypes", [DefaultItemCategoryService_1.DefaultItemCategoryService,
        DefaultProfileService_1.DefaultProfileService,
        DefaultMarketService_1.DefaultMarketService,
        MarketService_1.MarketService,
        ProfileService_1.ProfileService,
        ListingItemTemplateService_1.ListingItemTemplateService,
        ListingItemService_1.ListingItemService,
        ItemCategoryService_1.ItemCategoryService,
        FavoriteItemService_1.FavoriteItemService,
        ItemInformationService_1.ItemInformationService,
        BidService_1.BidService,
        OrderService_1.OrderService,
        ItemImageService_1.ItemImageService,
        PaymentInformationService_1.PaymentInformationService,
        ActionMessageService_1.ActionMessageService,
        CoreRpcService_1.CoreRpcService,
        OrderFactory_1.OrderFactory, Object])
], TestDataService);
exports.TestDataService = TestDataService;
//# sourceMappingURL=TestDataService.js.map