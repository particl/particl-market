import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';

import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/MarketService';
import { ListingItemActionService } from '../../../src/api/services/ListingItemActionService';

import { ListingItemFactory } from '../../../src/api/factories/ListingItemFactory';

import { ListingItemMessage } from '../../../src/api/messages/ListingItemMessage';
import * as listingItemSmsg1 from '../../testdata/message/smsgMessageWithListingItemMessage1.json';

import * as resources from 'resources';
import {GenerateListingItemTemplateParams} from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import {CreatableModel} from '../../../src/api/enums/CreatableModel';
import {TestDataGenerateRequest} from '../../../src/api/requests/TestDataGenerateRequest';


describe('ListingItemMessage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let listingItemFactory: ListingItemFactory;
    let listingItemActionService: ListingItemActionService;

    let defaultMarket;

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemFactory = app.IoC.getNamed<ListingItemFactory>(Types.Factory, Targets.Factory.ListingItemFactory);
        listingItemActionService = app.IoC.getNamed<ListingItemActionService>(Types.Service, Targets.Service.ListingItemActionService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

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

        const marketplaceMessage = JSON.parse(listingItemSmsg1.text);
        marketplaceMessage.market = listingItemSmsg1.to;

        const result = await listingItemActionService.processListingItemReceivedEvent({
            smsgMessage: listingItemSmsg1,
            marketplaceMessage
        });

        // log.debug('result: ', JSON.stringify(result, null, 2));
        log.debug('listingItemMessage: ', JSON.stringify(marketplaceMessage.item, null, 2));
        log.debug('result.hash: ', JSON.stringify(result.hash, null, 2));
        log.debug('listingItemMessage.hash: ', JSON.stringify(marketplaceMessage.item.hash, null, 2));
        expectListingItemFromMessage(result, marketplaceMessage.item);

    });


    test('Should process MarketplaceEvent containing ListingItemMessage and match ListingItem with ListingItemTemplate', async () => {
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
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

        expect(listingItemTemplates[0].ListingItems.length).toBe(1);
        expect(listingItemTemplates[0].hash).toBe(listingItemTemplates[0].ListingItems[0].hash);

        const listingItemMessage = {
            hash: listingItemTemplates[0].hash,
            information: listingItemTemplates[0].ItemInformation,
            payment: listingItemTemplates[0].PaymentInformation,
            messaging: listingItemTemplates[0].MessagingInformation,
            objects: listingItemTemplates[0].ListingItems
        } as ListingItemMessage;

        const listingItemSmsg = listingItemSmsg1;
        listingItemSmsg.text = JSON.stringify(listingItemMessage);
        listingItemSmsg.from = listingItemTemplates[0].ListingItems[0].Seller;
        listingItemSmsg.to = defaultMarket.address;

        const marketplaceMessage = JSON.parse(listingItemSmsg1.text);
        marketplaceMessage.market = listingItemSmsg.to;
        marketplaceMessage.item = listingItemMessage;

        const result = await listingItemActionService.processListingItemReceivedEvent({
            smsgMessage: listingItemSmsg,
            marketplaceMessage
        });

        log.debug('listingItemMessage: ', JSON.stringify(marketplaceMessage.item, null, 2));
        log.debug('result.hash: ', JSON.stringify(result.hash, null, 2));
        log.debug('listingItemMessage.hash: ', JSON.stringify(marketplaceMessage.item.hash, null, 2));
        
        expectListingItemFromMessage(result, marketplaceMessage.item);
        expect(result.ListingItemTemplate.Id).toBe(listingItemTemplates[0].Id);
    });



    // todo: test with different types of data

});
