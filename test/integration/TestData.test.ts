import * as Bookshelf from 'bookshelf';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemCategoryService } from '../../src/api/services/ItemCategoryService';
import { AddressService } from '../../src/api/services/AddressService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { MessageException } from '../../src/api/exceptions/MessageException';

import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';

import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';

import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateBidParams } from '../../src/api/requests/params/GenerateBidParams';
import { Profile } from '../../src/api/models/Profile';
import { BidMessageType } from '../../src/api/enums/BidMessageType';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';

import { ListingItemMessageType } from '../../src/api/enums/ListingItemMessageType';
import * as listingItemTemplateCreateRequestBasic1 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic1.json';
import * as resources from 'resources';
import { OrderStatus } from '../../src/api/enums/OrderStatus';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { GenerateActionMessageParams } from '../../src/api/requests/params/GenerateActionMessageParams';
import { GenerateOrderParams } from '../../src/api/requests/params/GenerateOrderParams'

describe('TestDataService', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemCategoryService: ItemCategoryService;
    let addressService: AddressService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemCategoryService = app.IoC.getNamed<ItemCategoryService>(Types.Service, Targets.Service.ItemCategoryService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.AddressService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);

        // clean up the db
        await testDataService.clean();
    });

    afterAll(async () => {
        //
        // log.info('afterAll');
    });

    const expectGenerateProfile = (result: resources.Profile,
                                   shouldHaveCryptocurrencyAddresses: boolean = true,
                                   shouldHaveFavoriteItems: boolean = true,
                                   shouldHaveShippingAddresses: boolean = true,
                                   shouldHaveShoppingCart: boolean = true) => {

        expect(result.address).not.toBeNull();
        expect(result.name).not.toBeNull();

        if (shouldHaveCryptocurrencyAddresses) {
            expect(result.CryptocurrencyAddresses).not.toHaveLength(0);
            expect(result.CryptocurrencyAddresses[0].profileId).toBe(result.id);
            expect(result.CryptocurrencyAddresses[0].address).not.toBeNull();
            expect(result.CryptocurrencyAddresses[0].type).not.toBeNull();
        } else {
            expect(result.CryptocurrencyAddresses).toHaveLength(0);
        }

        if (shouldHaveFavoriteItems) {
            // TODO
            expect(result.FavoriteItems).not.toHaveLength(0);
        } else {
            expect(result.FavoriteItems).toHaveLength(0);
        }

        if (shouldHaveShippingAddresses) {
            expect(result.ShippingAddresses).not.toHaveLength(0);
            expect(result.ShippingAddresses[0].profileId).toBe(result.id);
            expect(result.ShippingAddresses[0].firstName).not.toBeNull();
            expect(result.ShippingAddresses[0].lastName).not.toBeNull();
            expect(result.ShippingAddresses[0].addressLine1).not.toBeNull();
            expect(result.ShippingAddresses[0].addressLine2).not.toBeNull();
            expect(result.ShippingAddresses[0].city).not.toBeNull();
            expect(result.ShippingAddresses[0].country).not.toBeNull();
            expect(result.ShippingAddresses[0].title).not.toBeNull();
            expect(result.ShippingAddresses[0].zipCode).not.toBeNull();
        } else {
            expect(result.ShippingAddresses).toHaveLength(0);
        }

        if (shouldHaveShoppingCart) {
            expect(result.ShoppingCart).toHaveLength(1);
            expect(result.ShoppingCart[0].name).toBe('DEFAULT');
        } else {
            expect(result.ShoppingCart).toHaveLength(0);
        }
    };


    const expectGenerateBid = (bidGenerateParams: GenerateBidParams, result: resources.Bid,
                               shouldHaveBidDatas: boolean = true,
                               shouldHaveShippingAddress: boolean = true) => {

        // log.debug('result: ', JSON.stringify(result, null, 2));
        // log.debug('bidGenerateParams: ', JSON.stringify(bidGenerateParams, null, 2));

        expect(result.action).toBe(bidGenerateParams.action);
        expect(result.bidder).toBe(bidGenerateParams.bidder);

        if (bidGenerateParams.generateListingItem) {
            expect(result.ListingItem).toBeDefined();
            expect(result.ListingItem.hash).not.toBeNull();

            if (bidGenerateParams.generateListingItemTemplate) {
                // TODO: if both are generated, same data should be used
                // generated template contains different data than the item
                // expect(result.ListingItem.hash).toBe(result.ListingItem.ListingItemTemplate.hash);
                expect(result.ListingItem.ListingItemTemplate).toBeDefined();
                expect(result.ListingItem.ListingItemTemplate.hash).not.toBeNull();
            } else {
                expect(result.ListingItem.ListingItemTemplate).not.toBeDefined();
            }

            if (bidGenerateParams.listingItemHash) {
                expect(result.ListingItem.hash).toBe(bidGenerateParams.listingItemHash);
            }

        } else {
            if (bidGenerateParams.listingItemHash) {
                expect(result.ListingItem.hash).toBe(bidGenerateParams.listingItemHash);
            }
            expect(result.ListingItem.ListingItemTemplate).toEqual({});
        }

        if (shouldHaveBidDatas) {
            expect(result.BidDatas).not.toHaveLength(0);
        } else {
            expect(result.BidDatas).toHaveLength(0);
        }

        if (shouldHaveShippingAddress) {
            expect(result.ShippingAddress.title).not.toBeNull();
            expect(result.ShippingAddress.firstName).not.toBeNull();
            expect(result.ShippingAddress.lastName).not.toBeNull();
            expect(result.ShippingAddress.addressLine1).not.toBeNull();
            expect(result.ShippingAddress.addressLine2).not.toBeNull();
            expect(result.ShippingAddress.city).not.toBeNull();
            expect(result.ShippingAddress.zipCode).not.toBeNull();
            expect(result.ShippingAddress.country).not.toBeNull();
        } else {
            expect(result.ShippingAddress).not.toBeDefined();
        }
    };

    const expectGenerateOrder = (orderGenerateParams: GenerateOrderParams, result: resources.Order) => {

        log.debug('result: ', JSON.stringify(result, null, 2));
        log.debug('orderGenerateParams: ', JSON.stringify(orderGenerateParams, null, 2));

        expect(result.hash).toBeDefined();

        expect(result.OrderItems[0].status).toBe(OrderStatus.AWAITING_ESCROW);

        if (orderGenerateParams.generateListingItem) {
            expect(result.OrderItems[0].Bid.ListingItem).toBeDefined();
            expect(result.OrderItems[0].Bid.ListingItem.hash).not.toBeNull();

            if (orderGenerateParams.generateListingItemTemplate) {
                // TODO: if both are generated, same data should be used
                expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate).toBeDefined();
                expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate.hash).not.toBeNull();
            } else {
                expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate).not.toBeDefined();
            }

            if (orderGenerateParams.listingItemHash) {
                expect(result.OrderItems[0].Bid.ListingItem.hash).toBe(orderGenerateParams.listingItemHash);
                expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate.hash).toBe(orderGenerateParams.listingItemHash);
            }

        } else {
            expect(result.OrderItems[0].Bid.ListingItem.ListingItemTemplate).not.toBeDefined();
        }

        if (orderGenerateParams.generateBid) {
            expect(result.OrderItems[0].Bid).toBeDefined();
        } else {
            expect(result.OrderItems[0].Bid).not.toBeDefined();
        }
    };

    test('Should create default data if seed=true', async () => {
        // clean removes all
        await testDataService.clean(true);
        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(80);

        const profile = await profileService.findAll();
        expect(profile).toHaveLength(1);

        const market = await marketService.findAll();
        expect(market).toHaveLength(1);
    });

    test('Should not create default data if seed=false', async () => {
        // clean removes all
        await testDataService.clean(false);
        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(0);

        const profile = await profileService.findAll();
        expect(profile).toHaveLength(0);

        const market = await itemCategoryService.findAll();
        expect(market).toHaveLength(0);
    });

    test('Should create ListingItemTemplate', async () => {
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        const defaultProfile: resources.Profile = defaultProfileModel.toJSON();

        const listingItemTemplateData = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic1));
        listingItemTemplateData.profile_id = defaultProfile.id;

        // TODO: create tests to test creation of different model types

        const createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            data: listingItemTemplateData,
            withRelated: true,
            timestampedHash: true
        } as TestDataCreateRequest);

        const result = createdListingItemTemplate.toJSON();
        const listingItemTemplate = await listingItemTemplateService.findAll();
        expect(listingItemTemplate).toHaveLength(1);

        expect(result.hash).not.toBeNull();
        expect(result.Profile.name).toBe(defaultProfile.name);

        // tslint:disable:max-line-length
        expect(result.ItemInformation.title).toBe(listingItemTemplateData.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(listingItemTemplateData.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(listingItemTemplateData.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(listingItemTemplateData.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(listingItemTemplateData.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(listingItemTemplateData.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(listingItemTemplateData.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(listingItemTemplateData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(listingItemTemplateData.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(listingItemTemplateData.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(listingItemTemplateData.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(result.ItemInformation.ItemImages).toHaveLength(5);
        expect(result.ItemInformation.listingItemId).toBe(null);
        expect(result.ItemInformation.listingItemTemplateId).toBe(result.id);

        expect(result.PaymentInformation.type).toBe(listingItemTemplateData.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(listingItemTemplateData.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(listingItemTemplateData.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(listingItemTemplateData.paymentInformation.escrow.ratio.seller);
        const resItemPrice = result.PaymentInformation.ItemPrice;
        expect(resItemPrice.currency).toBe(listingItemTemplateData.paymentInformation.itemPrice.currency);
        expect(resItemPrice.basePrice).toBe(listingItemTemplateData.paymentInformation.itemPrice.basePrice);
        expect(resItemPrice.ShippingPrice.domestic).toBe(listingItemTemplateData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(resItemPrice.ShippingPrice.international).toBe(listingItemTemplateData.paymentInformation.itemPrice.shippingPrice.international);

        expect(result.MessagingInformation[0].protocol).toBe(listingItemTemplateData.messagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(listingItemTemplateData.messagingInformation[0].publicKey);
        expect(result.MessagingInformation[0].listingItemId).toBe(null);
        // tslint:enable:max-line-length
    });

    test('Check generateActionMessages', async () => {
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        const defaultProfile: resources.Profile = defaultProfileModel.toJSON();

        const generateActionMessageParams = new GenerateActionMessageParams([
            true,
            true,
            true,
            ListingItemMessageType.MP_ITEM_ADD,
            'nonce',
            true,
            null,
            defaultProfile.address,
            1,
            'actionmessage',
            '0xf0afa0dbb1312410adaebccc12320567',
            'dadadafgagag',
            'testdatanotsorandommsgidfrom_generateListingItems'
        ]).toParamsArray();

        const actionMessages = await testDataService.generate({
            model: CreatableModel.ACTIONMESSAGE,
            amount: 1,
            withRelated: false,
            generateParams: generateActionMessageParams
        } as TestDataGenerateRequest);

        expect(actionMessages).toHaveLength(1);
        expect(actionMessages[0].ListingItem()).toBeNull();
        expect(actionMessages[0].nonce).toBe('nonce');
        expect(actionMessages[0].action).toBe(ListingItemMessageType.MP_ITEM_ADD);
        expect(actionMessages[0].MessageInfo().address).toBe(defaultProfile.address);
        expect(actionMessages[0].MessageInfo().memo).toBe('dadadafgagag');
        expect(actionMessages[0].MessageInfo().action_message_id).toBe(actionMessages[0].id);
        expect(actionMessages[0].MessageEscrow().action_message_id).toBe(actionMessages[0].id);
        expect(actionMessages[0].MessageEscrow().type).toBe('actionmessage');
        expect(actionMessages[0].MessageEscrow().rawtx).toBe('0xf0afa0dbb1312410adaebccc12320567');
        expect(actionMessages[0].MessageData().action_message_id).toBe(actionMessages[0].id);
        expect(actionMessages[0].MessageData().msgid).toBe('testdatanotsorandommsgidfrom_generateListingItems');
        expect(actionMessages[0].MessageData().version).toBe('0300');
        expect(actionMessages[0].MessageObjects()).toHaveLength(1);
        expect(actionMessages[0].MessageObjects()[0].action_message_id).toBe(actionMessages[0].id);
        expect(actionMessages[0].MessageObjects()[0].data_id).toBe('seller');
        expect(actionMessages[0].MessageObjects()[0].data_value).toBe(defaultProfile.address);
    });

    test('Should throw error message when passed model is invalid for create', async () => {
        expect.assertions(1);
        const model = 'testmodel';
        const createdData = await testDataService.create<ListingItemTemplate>({
            model,
            data: {
                hash : '123'
            } as any,
            withRelated: true
        } as TestDataCreateRequest).catch(e =>
            expect(e).toEqual(new MessageException('Not implemented'))
        );
    });

    test('Should generate single Profile', async () => {
        await testDataService.clean(false);

        let profiles: Bookshelf.Collection<Profile> = await testDataService.generate<Profile>({
            model: CreatableModel.PROFILE,
            amount: 1,
            withRelated: true
        } as TestDataGenerateRequest);
        const createdProfile = profiles[0];

        expectGenerateProfile(createdProfile, true, false, true, true);

        profiles = await profileService.findAll();
        expect(profiles).toHaveLength(1);
    });

    test('Should generate single Profile using withRelated=false and return only ids', async () => {
        await testDataService.clean(false);

        const profileIds: Bookshelf.Collection<Profile> = await testDataService.generate<Profile>({
            model: CreatableModel.PROFILE,
            amount: 1,
            withRelated: false
        } as TestDataGenerateRequest);

        expect(profileIds[0]).toBeGreaterThan(0);
        expect(profileIds).toHaveLength(1);

        const profile = await profileService.findOne(profileIds[0]);
        const createdProfile = profile.toJSON();
        expectGenerateProfile(createdProfile, true, false, true, true);

    });

    test('Should generate three Profiles', async () => {
        await testDataService.clean(false);

        const profiles: Bookshelf.Collection<Profile> = await testDataService.generate<Profile>({
            model: CreatableModel.PROFILE,
            amount: 3,
            withRelated: true
        } as TestDataGenerateRequest);

        const profile = await profileService.findAll();
        expect(profile).toHaveLength(3);
    });

    test('Should generate ListingItemTemplate using GenerateListingItemTemplateParams', async () => {
        await testDataService.clean(true);

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true,   // generateListingItemObjects
            true    // generateObjectDatas
        ]).toParamsArray();

        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams: generateListingItemTemplateParams
        } as TestDataGenerateRequest);

        // TODO: expects
    });

    test('Should throw error message when passed model is invalid for generate', async () => {
        expect.assertions(1);
        const model = 'invalidmodel';
        await testDataService.generate<Profile>({
            model,
            amount: 1,
            withRelated: true
        } as TestDataGenerateRequest).catch(e =>
            expect(e).toEqual(new MessageException('Not implemented'))
        );
    });

    test('Should generate Bid using GenerateBidParams, generating a ListingItemTemplate and a ListingItem', async () => {
        await testDataService.clean(true);

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        const defaultProfile: resources.Profile = defaultProfileModel.toJSON();

        const bidGenerateParams = new GenerateBidParams([
            true,                       // generateListingItemTemplate
            true,                       // generateListingItem
            null,                       // listingItemhash
            BidMessageType.MPA_BID,     // action
            defaultProfile.address      // bidder
        ]);

        const generatedBids = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);

        const bid = generatedBids[0];

        expectGenerateBid(bidGenerateParams, bid, false, true);
    });

    test('Should generate Bid using GenerateBidParams, with a relation to existing ListingItem', async () => {
        await testDataService.clean(true);

        // generate listingitemtemplate
        const generateListingItemParams = new GenerateListingItemParams().toParamsArray();
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,
            amount: 1,
            withRelated: true,
            generateParams: generateListingItemParams
        } as TestDataGenerateRequest);

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        const defaultProfile: resources.Profile = defaultProfileModel.toJSON();

        const bidGenerateParams = new GenerateBidParams([
            false,                          // generateListingItemTemplate
            false,                          // generateListingItem
            listingItems[0].hash,           // listingItemHash
            BidMessageType.MPA_BID,         // action
            defaultProfile.address          // bidder
            // defaultProfile.address       // listingitem seller
        ]);

        const generatedBids = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);

        const bid = generatedBids[0];
        expectGenerateBid(bidGenerateParams, bid, false, true);

        expect(bid.ListingItem.hash).toBe(listingItems[0].hash);
        // expect(bid.ListingItem.seller).toBe(defaultProfile.address);

    });

    test('Should generate Order using GenerateOrderParams, with a relation to existing ListingItem', async () => {
        await testDataService.clean(true);

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        const defaultProfile: resources.Profile = defaultProfileModel.toJSON();

        // [0]: generateListingItemTemplate, generate a ListingItemTemplate
        // [1]: generateListingItem, generate a ListingItem
        // [2]: generateBid, generate a Bid
        // [3]: listingItemhash, attach bid to existing ListingItem
        // [4]: bidId, attach Order to existing Bid
        // [5]: bidder, bidders address
        // [6]: listingItemSeller, ListingItem sellers address

        const orderGenerateParams = new GenerateOrderParams([
            true,                       // generateListingItemTemplate
            true,                       // generateListingItem
            true,                       // generateBid
            null,                       // listingItemhash
            null,                       // bidId
            null,                       // bidder
            defaultProfile.address      // listingItemSeller
        ]);

        const generatedOrders = await testDataService.generate({
            model: CreatableModel.ORDER,
            amount: 1,
            withRelated: true,
            generateParams: orderGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);

        const order = generatedOrders[0];

        expectGenerateOrder(orderGenerateParams, order);


    });

    test('Should cleanup all tables', async () => {

        // TODO: needs to be updated, should check that all tables are cleaned

        expect.assertions(4);
        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(80);

        // default profile should not contain addresses
        const addresses = await addressService.findAll();
        expect(addresses).toHaveLength(0);

        // listingitemTemplates should have been be removed
        const listingItems = await listingItemTemplateService.findAll();
        expect(listingItems).toHaveLength(0);

        // only default profile
        const profiles = await profileService.findAll();
        expect(profiles).toHaveLength(1);
    });

});
