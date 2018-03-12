import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { ListingItemService } from '../../../src/api/services/ListingItemService';

import { ListingItemMessageProcessor } from '../../../src/api/messageprocessors/ListingItemMessageProcessor';
import { ListingItemMessage } from '../../../src/api/messages/ListingItemMessage';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { MarketService } from '../../../src/api/services/MarketService';
import { ListingItemFactory } from '../../../src/api/factories/ListingItemFactory';
import * as listingItemTemplateBasic from '../testdata/listingitemtemplate/listingItemTemplateBasic.json';
import * as listingItemCategoryWithRelated from '../testdata/category/listingItemCategoryWithRelated.json';


describe('ListingItemMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemService: ListingItemService;
    let marketService: MarketService;
    let listingItemMessageProcessor: ListingItemMessageProcessor;
    let listingItemFactory: ListingItemFactory;

    // let listingItemTemplates;

    // tslint:disable:max-line-length
    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemMessageProcessor = app.IoC.getNamed<ListingItemMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.ListingItemMessageProcessor);
        listingItemFactory = app.IoC.getNamed<ListingItemFactory>(Types.Factory, Targets.Factory.ListingItemFactory);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const defaultMarket = await marketService.getDefault();
/*
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        listingItemTemplates = await testDataService.generate<ListingItemTemplate>({
            model: CreatableModel.LISTINGITEMTEMPLATE,  // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemTemplateParams   // what kind of data to generate
        } as TestDataGenerateRequest);
*/
    });
    // tslint:enable:max-line-length

    afterAll(async () => {
        //
    });

    test('Should create a ListingItem from ListingItemMessage', async () => {

        // first create the message
        const message = await listingItemFactory.getMessage(listingItemTemplateBasic, listingItemCategoryWithRelated);

        // then run the processor
        const createdListingItem = await listingItemMessageProcessor.process(message);
        const result = createdListingItem.toJSON();

        // test the values
        expect(result.id).not.toBeNull();
        expect(result.hash).toBe(message.hash);

        // ItemInformation
        expect(result.ItemInformation.title).toBe(message.information.title);
        expect(result.ItemInformation.shortDescription).toBe(message.information.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(message.information.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(message.information.category[2]);
        expect(result.ItemInformation.ItemCategory.key).toBeNull();
        expect(result.ItemInformation.ItemCategory.parentItemCategoryId).not.toBeNull();

        // paymentInformation
        expect(result.PaymentInformation.type).toBe(message.payment.type);
        expect(result.PaymentInformation.Escrow.type).toBe(message.payment.escrow.type);
        const itemPrice = result.PaymentInformation.ItemPrice;
        expect(itemPrice.currency).toBe(message.payment.itemPrice.currency);
        expect(itemPrice.basePrice).toBe(message.payment.itemPrice.basePrice);

        // messaging-information
        expect(result.MessagingInformation[0].protocol).toBe(message.messaging[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(message.messaging[0].public_key);

        // listingitem-object
        // TODO fix this
        // expect(result.ListingItemObjects[0].type).toBe(message.objects[0].type);
        // expect(result.ListingItemObjects[0].description).toBe(message.objects[0].description);
        // expect(result.ListingItemObjects[0].order).toBe(message.objects[0].order);
    });

    test('Should create a Listing without messaging information', async () => {
        // delete messaging
        delete testData.messaging;
        testData.hash = ObjectHash.getHash(testData);
        createdListingItemTwo = await listingItemMessageProcessor.process(testData as ListingItemMessage);
        const result = createdListingItemTwo.toJSON();
        createdItemInformation2 = result.ItemInformation;
        createdPaymentInformation2 = result.PaymentInformation;
        createdMessagingInformation2 = result.MessagingInformation;
        createtListingItemObject2 = result.ListingItemObjects;

        // test the values
        expect(result.id).not.toBeNull();
        // ItemInformation
        expect(result.ItemInformation.title).toBe(testData.information.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.information.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.information.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.information.category[2]);

        // paymentInformation
        expect(result.PaymentInformation.type).toBe(testData.payment.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.payment.escrow.type);
        const itemPrice = result.PaymentInformation.ItemPrice;
        expect(itemPrice.currency).toBe(testData.payment.itemPrice.currency);
        expect(itemPrice.basePrice).toBe(testData.payment.itemPrice.basePrice);

        // listingitem-object
        expect(result.ListingItemObjects[0].type).toBe(objects[0].type);
        expect(result.ListingItemObjects[0].description).toBe(objects[0].description);
        expect(result.ListingItemObjects[0].order).toBe(objects[0].order);
    });


    test('Should delete the created listing items', async () => {
        // delete the both created listing items
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        let itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        let locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        let shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        let itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // escrow
        let escrowId = createdPaymentInformation.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        let escrowRatioId = createdPaymentInformation.Escrow.Ratio.id;
        await escrowRatioService.findOne(escrowRatioId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowRatioId))
        );

        // itemPrice
        let itemPriceId = createdPaymentInformation.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        let shippingPriceId = createdPaymentInformation.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        let cryptoCurrencyId = createdPaymentInformation.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

        // messagingInformation
        const messagingInformationId = createdMessagingInformation[0].id;
        await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(messagingInformationId))
        );

        // listingitemObject
        let listingItemObjectsId = createtListingItemObject[0].id;
        await listingItemObjectService.findOne(listingItemObjectsId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemObjectsId))
        );

        // remove 2nd
        await listingItemService.destroy(createdListingItemTwo.id);
        await listingItemService.findOne(createdListingItemTwo.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemTwo.id))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation2.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation2.id))
        );

        // item-location
        itemLocationId = createdItemInformation2.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        locationMarkerId = createdItemInformation2.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        shipDestinationId = createdItemInformation2.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        itemImageId = createdItemInformation2.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation2.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation2.id))
        );

        // escrow
        escrowId = createdPaymentInformation2.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        escrowRatioId = createdPaymentInformation2.Escrow.Ratio.id;
        await escrowRatioService.findOne(createdPaymentInformation2.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation2.id))
        );

        // itemPrice
        itemPriceId = createdPaymentInformation2.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        shippingPriceId = createdPaymentInformation2.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        cryptoCurrencyId = createdPaymentInformation2.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

        // listingitemObject
        listingItemObjectsId = createtListingItemObject2[0].id;
        await listingItemObjectService.findOne(listingItemObjectsId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemObjectsId))
        );
    });

});
