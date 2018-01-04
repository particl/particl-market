import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemCategoryService } from '../../src/api/services/ItemCategoryService';
import { AddressService } from '../../src/api/services/AddressService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ListingItemService } from '../../src/api/services/ListingItemService';

describe('TestDataService', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemCategoryService: ItemCategoryService;
    let addressService: AddressService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemCategoryService = app.IoC.getNamed<ItemCategoryService>(Types.Service, Targets.Service.ItemCategoryService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.AddressService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

        // clean up the db
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
        // log.info('afterAll');
    });

    test('Should find the default categories after startup', async () => {
        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(80);
    });

    // test('Should skip cleanup of given table', async () => {
    //     await listingItemService.create({hash: 'ASDF'});
    //     await testDataService.clean(['listing_items']);

    //     const listingItems = await listingItemService.findAll();
    //     expect(listingItems).toHaveLength(1);
    // });

    test('Should cleanup all tables', async () => {
        // clean removes all and then seeds the default category and profile data
        await testDataService.clean([]);

        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(80);
        // default profile should not contain addresses
        const addresses = await addressService.findAll();
        expect(addresses).toHaveLength(0);

        // listingitems should have been be removed
        const listingItems = await listingItemService.findAll();
        expect(listingItems).toHaveLength(0);
    });

});
