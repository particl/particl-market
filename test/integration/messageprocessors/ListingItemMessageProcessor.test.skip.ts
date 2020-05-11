// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/model/MarketService';
import { ListingItemAddActionService } from '../../../src/api/services/action/ListingItemAddActionService';
import { ListingItemFactory } from '../../../src/api/factories/model/ListingItemFactory';
import { ListingItemAddMessage } from '../../../src/api/messages/action/ListingItemAddMessage';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../../src/api/requests/testdata/TestDataGenerateRequest';
import { ProfileService } from '../../../src/api/services/model/ProfileService';
import { MarketplaceMessage } from '../../../src/api/messages/MarketplaceMessage';
import { ListingItemService } from '../../../src/api/services/model/ListingItemService';
import { ListingItemTemplateService } from '../../../src/api/services/model/ListingItemTemplateService';
import { CoreSmsgMessage } from '../../../src/api/messages/CoreSmsgMessage';
import { SmsgMessageStatus } from '../../../src/api/enums/SmsgMessageStatus';


describe('ListingItemMessage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemFactory: ListingItemFactory;
    let listingItemActionService: ListingItemAddActionService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    let listingItemTemplates: resources.ListingItemTemplate[];

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemActionService = app.IoC.getNamed<ListingItemAddActionService>(Types.Service, Targets.Service.action.ListingItemAddActionService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        listingItemFactory = app.IoC.getNamed<ListingItemFactory>(Types.Factory, Targets.Factory.model.ListingItemFactory);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile + market
        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefaultForProfile(defaultProfile.id).then(value => value.toJSON());

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,    // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id,    // profileId
            false,   // generateListingItem
            defaultMarket.id     // marketId
        ]).toParamsArray();

        // generate two templates without an item
        listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 2,
            withRelated: true,
            generateParams: generateListingItemTemplateParams
        } as TestDataGenerateRequest);

        log.debug('listingItemTemplates[0].hash:', listingItemTemplates[0].hash);
        log.debug('listingItemTemplates[1].hash:', listingItemTemplates[1].hash);
        expect(listingItemTemplates.length).toBe(2);

    });
    // tslint:enable:max-line-length

    const expectListingItemFromMessage = (result: resources.ListingItem, message: ListingItemAddMessage) => {

        expect(result.id).not.toBeNull();
        expect(result.hash).not.toBeNull();

        // fields from message that we dont want to see
        expect(result).not.toHaveProperty('information');
        expect(result).not.toHaveProperty('payment');
        expect(result).not.toHaveProperty('messaging');
        expect(result).not.toHaveProperty('objects');

        // ItemInformation
        expect(result.ItemInformation.title).toBe(message.item.information.title);
        expect(result.ItemInformation.shortDescription).toBe(message.item.information.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(message.item.information.longDescription);

        // ItemInformation.ItemCategory
        expect(result.ItemInformation.ItemCategory.key).toBe(message.item.information.category[2]);
        expect(result.ItemInformation.ItemCategory.parentItemCategoryId).not.toBeNull();

        // ItemInformation.ItemLocation
        expect(result.ItemInformation.ItemLocation.country).toBe(message.item.information.location.country);
        expect(result.ItemInformation.ItemLocation.address).toBe(message.item.information.location.address);

        // ItemInformation.ItemLocation.LocationMarker
        expect(result.ItemInformation.ItemLocation.LocationMarker.title).toBe(message.item.information.location.gps.title);
        expect(result.ItemInformation.ItemLocation.LocationMarker.description).toBe(message.item.information.location.gps.description);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(message.item.information.location.gps.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(message.item.information.location.gps.lng);

        // ItemInformation.ShippingDestinations
        expect(result.ItemInformation.ShippingDestinations.length).toBe(message.item.information.shippingDestinations.length);
        // todo: test the shipping destinations
        // expect(message.information.shipping_destinations).toContain('-MOROCCO');
        // expect(message.information.shipping_destinations).toContain('PANAMA');

        // ItemInformation.ItemImages
        expect(result.ItemInformation.ItemImages.length).toBe(message.item.information.images.length);
        // todo: test the images
        // expect(message.information.images[0].hash).toBe(testData.ItemInformation.ItemImages[0].hash);
        // expect(message.information.images[0].data.length).toBe(1);
        // expect(message.information.images[0].data[0].protocol).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].protocol);
        // expect(message.information.images[0].data[0].encoding).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].encoding);
        // expect(message.information.images[0].data[0].data).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].data);

        // PaymentInformation
        expect(result.PaymentInformation.type).toBe(message.item.payment.type);

        // PaymentInformation.Escrow
        expect(result.PaymentInformation.Escrow.type).toBe(message.item.payment.escrow.type);

        // PaymentInformation.Escrow.Ratio
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(message.item.payment.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(message.item.payment.escrow.ratio.seller);

        // PaymentInformation.ItemPrice
        const itemPrice = result.PaymentInformation.ItemPrice;
        expect(itemPrice.currency).toBe(message.item.payment.options[0].currency);
        expect(itemPrice.basePrice).toBe(message.item.payment.options[0].base_price);

        // PaymentInformation.ItemPrice.CryptocurrencyAddress
        const cryptocurrencyAddress = result.PaymentInformation.ItemPrice.CryptocurrencyAddress;
        expect(cryptocurrencyAddress.type).toBe(message.item.payment.options[0].address.type);
        expect(cryptocurrencyAddress.address).toBe(message.item.payment.options[0].address.address);

        // PaymentInformation.ItemPrice.ShippingPrice
        const shippingPrice = result.PaymentInformation.ItemPrice.ShippingPrice;
        expect(shippingPrice.domestic).toBe(message.item.payment.options[0].shipping_price.domestic);
        expect(shippingPrice.international).toBe(message.item.payment.options[0].shipping_price.international);

        // MessagingInformation
        expect(result.MessagingInformation[0].protocol).toBe(message.item.messaging[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(message.item.messaging[0].public_key);

        // listingitem-object
        // TODO test listingitemobjects
        // expect(result.ListingItemObjects[0].type).toBe(message.objects[0].type);
        // expect(result.ListingItemObjects[0].description).toBe(message.objects[0].description);
        // expect(result.ListingItemObjects[0].order).toBe(message.objects[0].order);
    };

    test('Should process MarketplaceMessageEvent containing ListingItemMessage', async () => {

        // the first template is used to generate the message and is deleted before message processing to
        // test processing on a situation where the message receiver is not the seller

        // there should be no related ListingItems
        expect(listingItemTemplates[0].ListingItems.length).toBe(0);

        // just to be sure, fetch it, and test again
        const listingItemTemplateModel = await listingItemTemplateService.findOneByHash(listingItemTemplates[0].hash);
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();
        expect(listingItemTemplate.ListingItems.length).toBe(0);

        // prepare the message to be processed
        const listingItemMessage: ListingItemAddMessage = await listingItemFactory.get(listingItemTemplates[0]);

        const marketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            item: listingItemMessage,
            market: defaultMarket.address
        } as MarketplaceMessage;

        // put the MarketplaceMessage in SmsgMessage
        const listingItemSmsg = {
            msgid: 'TESTMESSAGE' + new Date().getTime(),
            version: '0300',
            location: 'inbox',
            read: false,
            paid: false,
            payloadsize: 100,
            received: new Date().getTime(),
            sent: new Date().getTime(),
            expiration: new Date().getTime(),
            daysretention: 4,
            from: defaultProfile.address,
            to: defaultMarket.address,
            text: JSON.stringify(marketplaceMessage)
        } as CoreSmsgMessage;

        // we have the message, so remove the template
        await listingItemTemplateService.destroy(listingItemTemplates[0].id);

        // process the message like it was received from the network
        const status: SmsgMessageStatus = await listingItemActionService.onEvent({
            smsgMessage: listingItemSmsg,
            marketplaceMessage
        });

        expect(status).toBe(SmsgMessageStatus.PROCESSED);

        const listingItemModel = await listingItemService.findOneByHash(listingItemMessage.hash);
        const listingItem: resources.ListingItem = listingItemModel.toJSON();

        // common ListingItem expects, expect listingitem to match with the message
        expectListingItemFromMessage(listingItem, listingItemMessage);

    });

    test('Should process MarketplaceMessageEvent containing ListingItemMessage and match ListingItem with ListingItemTemplate', async () => {

        // there should be no related ListingItem yet
        expect(listingItemTemplates[1].ListingItems.length).toBe(0);

        // just to be sure, fetch it
        const listingItemTemplateModel = await listingItemTemplateService.findOneByHash(listingItemTemplates[1].hash);
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();
        expect(listingItemTemplate.ListingItems.length).toBe(0);

        // prepare the message to be processed
        const listingItemMessage: ListingItemAddMessage = await listingItemFactory.get(listingItemTemplates[1]);

        const marketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            item: listingItemMessage,
            market: defaultMarket.address
        } as MarketplaceMessage;

        // put the MarketplaceMessage in SmsgMessage
        const listingItemSmsg = {
            msgid: 'TESTMESSAGE' + new Date().getTime(),
            version: '0300',
            location: 'inbox',
            read: false,
            paid: false,
            payloadsize: 100,
            received: new Date().getTime(),
            sent: new Date().getTime(),
            expiration: new Date().getTime(),
            daysretention: 4,
            from: defaultProfile.address,
            to: defaultMarket.address,
            text: JSON.stringify(marketplaceMessage)
        } as CoreSmsgMessage;

        // process the message like it was received from the network
        const status: SmsgMessageStatus = await listingItemActionService.onEvent({
            smsgMessage: listingItemSmsg,
            marketplaceMessage
        });

        expect(status).toBe(SmsgMessageStatus.PROCESSED);

        const listingItemModel = await listingItemService.findOneByHash(listingItemMessage.hash);
        const listingItem: resources.ListingItem = listingItemModel.toJSON();

        // common ListingItem expects, expect listingitem to match with the message
        expectListingItemFromMessage(listingItem, listingItemMessage);

        // as a result we should have gotten ListingItem with a relation to the ListingItemTemplate with matching hashes
        expect(listingItem.ListingItemTemplate).toBeDefined();
        expect(listingItem.ListingItemTemplate.hash).toBe(listingItem.hash);
    });


    // todo: test with different types of data

});
