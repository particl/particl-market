import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ItemImageData } from '../../src/api/models/ItemImageData';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { ItemImageDataService } from '../../src/api/services/ItemImageDataService';

describe('ItemImageData', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemImageDataService: ItemImageDataService;

    let createdId;

    const testData = {
        dataId: 'QmUwHMFY9GSiKgjqyZpgAv2LhBrh7GV8rtLuagbry9wmMU',
        protocol: ImageDataProtocolType.IPFS,
        encoding: null,
        data: null
    };

    const testDataUpdated = {
        dataId: null,
        protocol: ImageDataProtocolType.LOCAL,
        encoding: 'BASE64',
        data: 'BASE64 encoded image data'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageDataService = app.IoC.getNamed<ItemImageDataService>(Types.Service, Targets.Service.ItemImageDataService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_image_id', async () => {
        expect.assertions(1);
        await itemImageDataService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new item image data', async () => {
        testData['item_image_id'] = 0;
        const itemImageDataModel: ItemImageData = await itemImageDataService.create(testData);
        createdId = itemImageDataModel.Id;

        const result = itemImageDataModel.toJSON();

        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
        expect(result.data).toBe(testData.data);
    });

    test('Should throw ValidationException because we want to create a empty item image data', async () => {
        expect.assertions(1);
        await itemImageDataService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list item image datas with our new create one', async () => {
        const itemImageDataCollection = await itemImageDataService.findAll();
        const itemImageData = itemImageDataCollection.toJSON();
        expect(itemImageData.length).toBe(1);

        const result = itemImageData[0];

        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
        expect(result.data).toBe(testData.data);
    });

    test('Should return one item image data', async () => {
        const itemImageDataModel: ItemImageData = await itemImageDataService.findOne(createdId);
        const result = itemImageDataModel.toJSON();

        expect(result.dataId).toBe(testData.dataId);
        expect(result.protocol).toBe(testData.protocol);
        expect(result.encoding).toBe(testData.encoding);
        expect(result.data).toBe(testData.data);
    });

    test('Should throw ValidationException because there is no item_image_id', async () => {
        expect.assertions(1);
        await itemImageDataService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the item image data', async () => {
        testDataUpdated['item_image_id'] = 0;
        const itemImageDataModel: ItemImageData = await itemImageDataService.update(createdId, testDataUpdated);
        const result = itemImageDataModel.toJSON();

        expect(result.dataId).toBe(testDataUpdated.dataId);
        expect(result.protocol).toBe(testDataUpdated.protocol);
        expect(result.encoding).toBe(testDataUpdated.encoding);
        expect(result.data).toBe(testDataUpdated.data);
    });

    test('Should delete the item image data', async () => {
        expect.assertions(1);
        await itemImageDataService.destroy(createdId);
        await itemImageDataService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
