import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemCategoryService } from '../../src/api/services/ItemCategoryService';
import { AddressService } from '../../src/api/services/AddressService';

describe('TestDataService', () => {

    // jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemCategoryService: ItemCategoryService;
    let addressService: AddressService;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemCategoryService = app.IoC.getNamed<ItemCategoryService>(Types.Service, Targets.Service.ItemCategoryService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.AddressService);

        // clean up everything
        // await testDataService.clean([]);
    });

    afterAll(async () => {
        //
        // log.info('afterAll');
    });

    test('Should find the default categories after startup', async () => {
        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(80);
    });

    test('Should skip cleanup of given table', async () => {
        await testDataService.clean(['item_categories']);
        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(80);
    });

    test('Should cleanup of all tables', async () => {
        await testDataService.clean([]);
        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(0);
        const addresses = await addressService.findAll();
        expect(addresses).toHaveLength(0);
    });

});
