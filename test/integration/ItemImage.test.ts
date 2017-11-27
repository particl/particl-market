import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ItemImage } from '../../src/api/models/ItemImage';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { ItemImageService } from '../../src/api/services/ItemImageService';

describe('ItemImage', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemImageService: ItemImageService;

    let createdId;

    const testData = {
        hash: 'asdfasdfasdfasdf',
        data: {
            dataId: 'QmUwHMFY9GSiKgjqyZpgAv2LhBrh7GV8rtLuagbry9wmMU',
            protocol: ImageDataProtocolType.IPFS,
            encoding: null,
            data: null
        }
    };

    const testDataUpdated = {
        hash: 'wqerqwerqwerqwerqwer',
        data: {
            dataId: null,
            protocol: ImageDataProtocolType.LOCAL,
            encoding: 'BASE64',
            data: 'BASE64 encoded image data'
        }
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new item image', async () => {
        const itemImageModel: ItemImage = await itemImageService.create(testData);
        createdId = itemImageModel.Id;

        const result = itemImageModel.toJSON();

        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageData.dataId).toBe(testData.data.dataId);
        expect(result.ItemImageData.protocol).toBe(testData.data.protocol);
        expect(result.ItemImageData.encoding).toBe(testData.data.encoding);
        expect(result.ItemImageData.data).toBe(testData.data.data);
    });

    test('Should throw ValidationException because we want to create a empty item image', async () => {
        expect.assertions(1);
        await itemImageService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list item images with our new create one', async () => {
        const itemImageCollection = await itemImageService.findAll();
        const itemImage = itemImageCollection.toJSON();
        expect(itemImage.length).toBe(1);

        const result = itemImage[0];

        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageData).toBe(undefined); // doesnt fetch related
    });

    test('Should return one item image', async () => {
        const itemImageModel: ItemImage = await itemImageService.findOne(createdId);
        const result = itemImageModel.toJSON();

        expect(result.hash).toBe(testData.hash);
        expect(result.ItemImageData.dataId).toBe(testData.data.dataId);
        expect(result.ItemImageData.protocol).toBe(testData.data.protocol);
        expect(result.ItemImageData.encoding).toBe(testData.data.encoding);
        expect(result.ItemImageData.data).toBe(testData.data.data);
    });

    test('Should update the item image', async () => {
        const itemImageModel: ItemImage = await itemImageService.update(createdId, testDataUpdated);
        const result = itemImageModel.toJSON();

        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.ItemImageData.dataId).toBe(testDataUpdated.data.dataId);
        expect(result.ItemImageData.protocol).toBe(testDataUpdated.data.protocol);
        expect(result.ItemImageData.encoding).toBe(testDataUpdated.data.encoding);
        expect(result.ItemImageData.data).toBe(testDataUpdated.data.data);
    });

    test('Should delete the item image', async () => {
        expect.assertions(1);
        await itemImageService.destroy(createdId);
        await itemImageService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
