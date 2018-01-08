import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { ListingItemService } from '../../../src/api/services/ListingItemService';

import { ListingItemMessageProcessor } from '../../../src/api/messageprocessors/ListingItemMessageProcessor';
import { ListingItemMessage } from '../../../src/api/messages/ListingItemMessage';

describe('ListingItemMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemMessageProcessor: ListingItemMessageProcessor;
    let listingItemService: ListingItemService;
    let createdListingItem;
    let createdListingItemTwo;

    const messaging = [{ protocol: 'SMSG', public_key: 'publickey2' }];
    const testData = {
        information: {
            title: 'Title of the item',
            short_description: 'A short description / summary of item',
            long_description: 'A longer description of the item or service',
            category: [
                'cat_ROOT',
                'Subcategory',
                'Subsubcategory'
            ]
        },
        payment: {
            type: 'SALE',
            escrow: {
                type: 'NOP'
            },
            cryptocurrency: { currency: 'BITCOIN', base_price: 100000000 }
        },
        messaging
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app
        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        listingItemMessageProcessor = app.IoC.getNamed<ListingItemMessageProcessor>(Types.MessageProcessor,
            Targets.MessageProcessor.ListingItemMessageProcessor);
        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new Listing Item by ListingItemMessage', async () => {
        createdListingItem = await listingItemMessageProcessor.process(testData as ListingItemMessage);
        const result = createdListingItem.toJSON();
        // test the values
        expect(result.id).not.toBeNull();
        // ItemInformation
        expect(result.ItemInformation.title).toBe(testData.information.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.information.short_description);
        expect(result.ItemInformation.longDescription).toBe(testData.information.long_description);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.information.category[2]);

        // paymentInformation
        expect(result.PaymentInformation.type).toBe(testData.payment.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.payment.escrow.type);
        const itemPrice = result.PaymentInformation.ItemPrice;
        expect(itemPrice.currency).toBe(testData.payment.cryptocurrency.currency);
        expect(itemPrice.basePrice).toBe(testData.payment.cryptocurrency.base_price);

        // messaging-infomration
        expect(result.MessagingInformation[0].protocol).toBe(messaging[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(messaging[0].public_key);
    });

    test('Should create a Listing without messaging information', async () => {
        delete testData.messaging;
        createdListingItemTwo = await listingItemMessageProcessor.process(testData as ListingItemMessage);
        const result = createdListingItemTwo.toJSON();
        // test the values
        expect(result.id).not.toBeNull();
        // ItemInformation
        expect(result.ItemInformation.title).toBe(testData.information.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.information.short_description);
        expect(result.ItemInformation.longDescription).toBe(testData.information.long_description);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.information.category[2]);

        // paymentInformation
        expect(result.PaymentInformation.type).toBe(testData.payment.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.payment.escrow.type);
        const itemPrice = result.PaymentInformation.ItemPrice;
        expect(itemPrice.currency).toBe(testData.payment.cryptocurrency.currency);
        expect(itemPrice.basePrice).toBe(testData.payment.cryptocurrency.base_price);
    });


    test('Should delete the created listing items', async () => {
     // delete the both created listing items
     await listingItemService.destroy(createdListingItem.id);
     await listingItemService.findOne(createdListingItem.id).catch(e =>
        expect(e).toEqual(new NotFoundException(createdListingItem.id))
      );

     await listingItemService.destroy(createdListingItemTwo.id);
     await listingItemService.findOne(createdListingItemTwo.id).catch(e =>
        expect(e).toEqual(new NotFoundException(createdListingItemTwo.id))
      );

  });

});
