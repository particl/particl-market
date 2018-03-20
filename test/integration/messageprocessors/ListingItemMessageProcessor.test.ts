import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';

// import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/MarketService';

import { ListingItemFactory } from '../../../src/api/factories/ListingItemFactory';

import { ListingItemMessageProcessor } from '../../../src/api/messageprocessors/ListingItemMessageProcessor';

import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { ListingItemMessage } from '../../../src/api/messages/ListingItemMessage';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { TestDataGenerateRequest } from '../../../src/api/requests/TestDataGenerateRequest';

import * as listingItemTemplateBasic from '../../testdata/model/listingItemTemplateBasic.json';
import * as listingItemCategoryWithRelated from '../../testdata/model/listingItemCategoryWithRelated.json';


describe('ListingItemMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let listingItemMessageProcessor: ListingItemMessageProcessor;
    let listingItemFactory: ListingItemFactory;

    let defaultMarket;

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemMessageProcessor = app.IoC.getNamed<ListingItemMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.ListingItemMessageProcessor);
        listingItemFactory = app.IoC.getNamed<ListingItemFactory>(Types.Factory, Targets.Factory.ListingItemFactory);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

    });
    // tslint:enable:max-line-length

    const expectListingItemFromMessage = (result: resources.ListingItem, message: ListingItemMessage) => {

        expect(result.id).not.toBeNull();
        expect(result.hash).toBe(message.hash);

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
        expect(result.ItemInformation.ShippingDestinations.length).toBe(2);
        // todo: test the shipping destinations
        // expect(message.information.shipping_destinations).toContain('-MOROCCO');
        // expect(message.information.shipping_destinations).toContain('PANAMA');

        // ItemInformation.ItemImages
        expect(result.ItemInformation.ItemImages.length).toBe(5);
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

    test('Should create a ListingItem from ListingItemMessage', async () => {

        // first create the message
        const message = await listingItemFactory.getMessage(listingItemTemplateBasic, listingItemCategoryWithRelated);

        // TODO: commented out because we're not currently using the processors
        // log.debug('message: ', JSON.stringify(message, null, 2));

        // then run the processor
        // const createdListingItem = await listingItemMessageProcessor.process(message, defaultMarket.address);
        // log.debug('createdListingItem: ', JSON.stringify(createdListingItem, null, 2));

        // const result = createdListingItem;

        // test that we have correctly converted the message
        // expectListingItemFromMessage(result, message);

    });

    // todo: test with different types of data

});