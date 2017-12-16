import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { ListingItemMessageProcessor } from '../../../src/api/messageprocessors/ListingItemMessageProcessor';

describe('ListingItemMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemMessageProcessor: ListingItemMessageProcessor;

    const testData = {
        information: {
            title: 'Title of the item',
            short_description: 'A short description / summary of item',
            long_description: 'A longer description of the item or service',
            category: [
                'cat_high_business_corporate',
                'Subcategory',
                'Subsubcategory'
            ]
        },
        payment: {
            type: 'SALE',
            escrow: {
                type: 'NOP'
            },
            cryptocurrency: [{ currency: 'BITCOIN', base_price: 100000000 }]
        },
        messaging: [{ protocol: 'SMSG', public_key: 'publickey2' }]
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app
        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemMessageProcessor = app.IoC.getNamed<ListingItemMessageProcessor>(Types.MessageProcessor,
            Targets.MessageProcessor.ListingItemMessageProcessor);
        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([], false);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new Listing Item by ListingItemMessage', async () => {
        const listingItem = await listingItemMessageProcessor.process(testData);
        const result = listingItem.toJSON();
        // test the values
        expect(result.id).not.toBeNull();
        expect(result.marketId).toBe('1'); // to be default
        // ItemInformation
        expect(result.ItemInformation.title).toBe(testData.information.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.information.short_description);
        expect(result.ItemInformation.longDescription).toBe(testData.information.long_description);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.information.category[2]);

        // paymentInformation
        expect(result.PaymentInformation.type).toBe(testData.payment.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.payment.escrow.type);
        const itemPrice = result.PaymentInformation.ItemPrice[0];
        expect(itemPrice.currency).toBe(testData.payment.cryptocurrency[0].currency);
        expect(itemPrice.basePrice).toBe(testData.payment.cryptocurrency[0].base_price);

        // messaging-infomration
        expect(result.MessagingInformation[0].protocol).toBe(testData.messaging[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(testData.messaging[0].public_key);
    });

});
