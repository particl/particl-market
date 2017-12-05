import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ItemCategory } from '../../src/api/models/ItemCategory';

import { ItemCategoryService } from '../../src/api/services/ItemCategoryService';

describe('ItemCategory', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemCategoryService: ItemCategoryService;

    let rootId;
    let createdId;
    let createdIdChild;
    let nullKeyId1;
    let nullKeyId2;

    const rootData = {
        key: 'cat_ROOT',
        name: 'ROOT',
        description: 'root'
    };

    const testData = {
        key: 'cat_electronics',
        name: 'Electronics and Technologyyyyyy',
        description: 'Electronics and Technology descriptionnnnnnn'
    };

    const testDataUpdated = {
        key: 'cat_technology',
        name: 'Electronics and Technology',
        description: 'Electronics and Technology description'
    };

    const testDataNullKey = {
        name: 'nullkey1',
        description: 'nullkey1'
    };

    const testDataChild = {
        key: 'cat_computer_systems_parts',
        name: 'Computer Systems and Parts',
        description: 'Computer Systems and Parts description'
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemCategoryService = app.IoC.getNamed<ItemCategoryService>(Types.Service, Targets.Service.ItemCategoryService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([], false);
    });

    afterAll(async () => {
        //
    });

    test('Should create a root item category', async () => {
        rootData['parent_item_category_id'] = 0;
        const itemCategoryModel: ItemCategory = await itemCategoryService.create(rootData);
        rootId = itemCategoryModel.Id;

        const result = itemCategoryModel.toJSON();

        expect(result.name).toBe(rootData.name);
        expect(result.description).toBe(rootData.description);
    });

    test('Should create a new item category', async () => {
        testData['parent_item_category_id'] = rootId;
        const itemCategoryModel: ItemCategory = await itemCategoryService.create(testData);
        createdId = itemCategoryModel.Id;

        const result = itemCategoryModel.toJSON();

        expect(result.name).toBe(testData.name);
        expect(result.description).toBe(testData.description);
    });

    test('Should create a new child item category', async () => {
        testDataChild['parent_item_category_id'] = createdId;
        const itemCategoryModel: ItemCategory = await itemCategoryService.create(testDataChild);
        createdIdChild = itemCategoryModel.Id;

        const result = itemCategoryModel.toJSON();

        expect(result.name).toBe(testDataChild.name);
        expect(result.description).toBe(testDataChild.description);
        expect(result.ParentItemCategory.id).toBe(testDataChild['parent_item_category_id']);
        expect(result.ParentItemCategory.ParentItemCategory.id).toBe(testData['parent_item_category_id']);
    });

    test('Should create a two item categories with null keys', async () => {
        testDataNullKey['parent_item_category_id'] = createdId;
        const itemCategoryModel1: ItemCategory = await itemCategoryService.create(testDataNullKey);
        nullKeyId1 = itemCategoryModel1.Id;
        const result1 = itemCategoryModel1.toJSON();
        expect(result1.key).toBe(null);
        expect(result1.name).toBe(testDataNullKey.name);
        expect(result1.description).toBe(testDataNullKey.description);

        const itemCategoryModel2: ItemCategory = await itemCategoryService.create(testDataNullKey);
        nullKeyId2 = itemCategoryModel2.Id;
        const result2 = itemCategoryModel2.toJSON();
        expect(result2.key).toBe(null);
        expect(result2.name).toBe(testDataNullKey.name);
        expect(result2.description).toBe(testDataNullKey.description);
    });

    test('Should throw ValidationException because we want to create a empty item category', async () => {
        expect.assertions(1);
        await itemCategoryService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should return one item category', async () => {
        const itemCategoryModel: ItemCategory = await itemCategoryService.findOne(createdId);
        const result = itemCategoryModel.toJSON();

        expect(result.name).toBe(testData.name);
        expect(result.description).toBe(testData.description);
    });

    test('Should update the item category', async () => {
        testDataUpdated['parent_item_category_id'] = 0;
        const itemCategoryModel: ItemCategory = await itemCategoryService.update(createdId, testDataUpdated);
        const result = itemCategoryModel.toJSON();

        expect(result.name).toBe(testDataUpdated.name);
        expect(result.description).toBe(testDataUpdated.description);
    });

    test('Should delete the item category', async () => {
        expect.assertions(6);
        await itemCategoryService.destroy(rootId);
        await itemCategoryService.findOne(rootId).catch(e =>
            expect(e).toEqual(new NotFoundException(rootId))
        );

        await itemCategoryService.destroy(createdId);
        await itemCategoryService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        await itemCategoryService.destroy(createdIdChild);
        await itemCategoryService.findOne(createdIdChild).catch(e =>
            expect(e).toEqual(new NotFoundException(createdIdChild))
        );

        await itemCategoryService.destroy(nullKeyId1);
        await itemCategoryService.findOne(nullKeyId1).catch(e =>
            expect(e).toEqual(new NotFoundException(nullKeyId1))
        );

        await itemCategoryService.destroy(nullKeyId2);
        await itemCategoryService.findOne(nullKeyId2).catch(e =>
            expect(e).toEqual(new NotFoundException(nullKeyId2))
        );
        const itemCategoryCollection = await itemCategoryService.findAll();
        const itemCategory = itemCategoryCollection.toJSON();
        expect(itemCategory.length).toBe(0);
    });

});
