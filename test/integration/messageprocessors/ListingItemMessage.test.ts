import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';

import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/MarketService';
import { ListingItemActionService } from '../../../src/api/services/ListingItemActionService';

import { ListingItemFactory } from '../../../src/api/factories/ListingItemFactory';

import { ListingItemMessage } from '../../../src/api/messages/ListingItemMessage';

import * as resources from 'resources';

import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../../src/api/requests/TestDataGenerateRequest';
import { ProfileService } from '../../../src/api/services/ProfileService';
import { MarketplaceMessage } from '../../../src/api/messages/MarketplaceMessage';
import { SmsgMessage } from '../../../src/api/messages/SmsgMessage';
import { ListingItemService } from '../../../src/api/services/ListingItemService';
import { ListingItemTemplateService } from '../../../src/api/services/ListingItemTemplateService';


describe('ListingItemMessage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemFactory: ListingItemFactory;
    let listingItemActionService: ListingItemActionService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    let listingItemTemplates: resources.ListingItemTemplate[];

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemFactory = app.IoC.getNamed<ListingItemFactory>(Types.Factory, Targets.Factory.ListingItemFactory);
        listingItemActionService = app.IoC.getNamed<ListingItemActionService>(Types.Service, Targets.Service.ListingItemActionService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
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

    const expectListingItemFromMessage = (result: resources.ListingItem, message: ListingItemMessage) => {

        expect(result.id).not.toBeNull();
        expect(result.hash).not.toBeNull();

        // fields from message that we dont want to see
        expect(result).not.toHaveProperty('information');
        expect(result).not.toHaveProperty('payment');
        expect(result).not.toHaveProperty('messaging');
        expect(result).not.toHaveProperty('objects');

        // ItemInformation
        expect(result.ItemInformation.title).toBe(message.information.title);
        expect(result.ItemInformation.shortDescription).toBe(message.information.short_description);
        expect(result.ItemInformation.longDescription).toBe(message.information.long_description);

        // ItemInformation.ItemCategory
        expect(result.ItemInformation.ItemCategory.key).toBe(message.information.category[2]);
        expect(result.ItemInformation.ItemCategory.parentItemCategoryId).not.toBeNull();

        // ItemInformation.ItemLocation
        expect(result.ItemInformation.ItemLocation.region).toBe(message.information.location.country);
        expect(result.ItemInformation.ItemLocation.address).toBe(message.information.location.address);

        // ItemInformation.ItemLocation.LocationMarker
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(message.information.location.gps.marker_title);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(message.information.location.gps.marker_text);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(message.information.location.gps.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(message.information.location.gps.lng);

        // ItemInformation.ShippingDestinations
        expect(result.ItemInformation.ShippingDestinations.length).toBe(message.information.shipping_destinations.length);
        // todo: test the shipping destinations
        // expect(message.information.shipping_destinations).toContain('-MOROCCO');
        // expect(message.information.shipping_destinations).toContain('PANAMA');

        // ItemInformation.ItemImages
        expect(result.ItemInformation.ItemImages.length).toBe(message.information.images.length);
        // todo: test the images
        // expect(message.information.images[0].hash).toBe(testData.ItemInformation.ItemImages[0].hash);
        // expect(message.information.images[0].data.length).toBe(1);
        // expect(message.information.images[0].data[0].protocol).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].protocol);
        // expect(message.information.images[0].data[0].encoding).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].encoding);
        // expect(message.information.images[0].data[0].data).toBe(testData.ItemInformation.ItemImages[0].ItemImageDatas[0].data);

        // PaymentInformation
        expect(result.PaymentInformation.type).toBe(message.payment.type);

        // PaymentInformation.Escrow
        expect(result.PaymentInformation.Escrow.type).toBe(message.payment.escrow.type);

        // PaymentInformation.Escrow.Ratio
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(message.payment.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(message.payment.escrow.ratio.seller);

        // PaymentInformation.ItemPrice
        const itemPrice = result.PaymentInformation.ItemPrice;
        expect(itemPrice.currency).toBe(message.payment.cryptocurrency[0].currency);
        expect(itemPrice.basePrice).toBe(message.payment.cryptocurrency[0].base_price);

        // PaymentInformation.ItemPrice.CryptocurrencyAddress
        const cryptocurrencyAddress = result.PaymentInformation.ItemPrice.CryptocurrencyAddress;
        expect(cryptocurrencyAddress.type).toBe(message.payment.cryptocurrency[0].address.type);
        expect(cryptocurrencyAddress.address).toBe(message.payment.cryptocurrency[0].address.address);

        // PaymentInformation.ItemPrice.ShippingPrice
        const shippingPrice = result.PaymentInformation.ItemPrice.ShippingPrice;
        expect(shippingPrice.domestic).toBe(message.payment.cryptocurrency[0].shipping_price.domestic);
        expect(shippingPrice.international).toBe(message.payment.cryptocurrency[0].shipping_price.international);

        // MessagingInformation
        expect(result.MessagingInformation[0].protocol).toBe(message.messaging[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(message.messaging[0].public_key);

        // listingitem-object
        // TODO test listingitemobjects
        // expect(result.ListingItemObjects[0].type).toBe(message.objects[0].type);
        // expect(result.ListingItemObjects[0].description).toBe(message.objects[0].description);
        // expect(result.ListingItemObjects[0].order).toBe(message.objects[0].order);
    };

    test('Should process MarketplaceEvent containing ListingItemMessage', async () => {

        // the first template is used to generate the message and is deleted before message processing to
        // test processing on a situation where the message receiver is not the seller

        // there should be no related ListingItems
        expect(listingItemTemplates[0].ListingItems.length).toBe(0);

        // just to be sure, fetch it, and test again
        const listingItemTemplateModel = await listingItemTemplateService.findOneByHash(listingItemTemplates[0].hash);
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();
        expect(listingItemTemplate.ListingItems.length).toBe(0);

        // prepare the message to be processed
        const listingItemMessage: ListingItemMessage = await listingItemFactory.getMessage(listingItemTemplates[0]);

        const marketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            item: listingItemMessage,
            market: defaultMarket.address
        } as MarketplaceMessage;

        // put the MarketplaceMessage in SmsgMessage
        const listingItemSmsg = {
            msgid: 'somethingnotsorandom',
            version: '0300',
            received: new Date().toISOString(),
            sent: new Date().toISOString(),
            from: defaultProfile.address,
            to: defaultMarket.address,
            text: JSON.stringify(marketplaceMessage)
        } as SmsgMessage;

        // we have the message, so remove the template
        await listingItemTemplateService.destroy(listingItemTemplates[0].id);

        // process the message like it was received from the network
        const result: resources.ListingItem = await listingItemActionService.processListingItemReceivedEvent({
            smsgMessage: listingItemSmsg,
            marketplaceMessage
        });

        // common ListingItem expects, expect listingitem to match with the message
        expectListingItemFromMessage(result, listingItemMessage);

    });

    test('Should process MarketplaceEvent containing ListingItemMessage and match ListingItem with ListingItemTemplate', async () => {

        // there should be no related ListingItem yet
        expect(listingItemTemplates[1].ListingItems.length).toBe(0);

        // just to be sure, fetch it
        const listingItemTemplateModel = await listingItemTemplateService.findOneByHash(listingItemTemplates[1].hash);
        const listingItemTemplate: resources.ListingItemTemplate = listingItemTemplateModel.toJSON();
        expect(listingItemTemplate.ListingItems.length).toBe(0);

        // prepare the message to be processed
        const listingItemMessage: ListingItemMessage = await listingItemFactory.getMessage(listingItemTemplates[1]);

        const marketplaceMessage = {
            version: process.env.MARKETPLACE_VERSION,
            item: listingItemMessage,
            market: defaultMarket.address
        } as MarketplaceMessage;

        // put the MarketplaceMessage in SmsgMessage
        const listingItemSmsg = {
            msgid: 'somethingnotsorandom',
            version: '0300',
            received: new Date().toISOString(),
            sent: new Date().toISOString(),
            from: defaultProfile.address,
            to: defaultMarket.address,
            text: JSON.stringify(marketplaceMessage)
        } as SmsgMessage;

        // process the message like it was received from the network
        const result: resources.ListingItem = await listingItemActionService.processListingItemReceivedEvent({
            smsgMessage: listingItemSmsg,
            marketplaceMessage
        });

        log.debug('listingItemMessage: ', JSON.stringify(marketplaceMessage.item, null, 2));
        log.debug('result.hash: ', JSON.stringify(result.hash, null, 2));

        // common ListingItem expects, expect listingitem to match with the message
        expectListingItemFromMessage(result, listingItemMessage);

        // as a result we should have gotten ListingItem with a relation to the ListingItemTemplate with matching hashes
        expect(result.ListingItemTemplate).toBeDefined();
        expect(result.ListingItemTemplate.hash).toBe(result.hash);
    });


    // todo: test with different types of data

});
