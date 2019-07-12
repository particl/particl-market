// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemCategoryService } from '../../src/api/services/model/ItemCategoryService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ItemCategoryCreateRequest } from '../../src/api/requests/model/ItemCategoryCreateRequest';
import { ItemCategoryUpdateRequest } from '../../src/api/requests/model/ItemCategoryUpdateRequest';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';

describe('ItemCategory', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemCategoryService: ItemCategoryService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

    let rootId;
    let createdId;
    let createdIdChild;

    const rootData = {
        parent_item_category_id: 0,
        key: 'cat_ROOT',
        name: 'ROOT',
        description: 'root'
    } as ItemCategoryCreateRequest;

    const testData = {
        parent_item_category_id: 0,
        key: 'cat_electronics',
        name: 'Electronics and Technologyyyyyy',
        description: 'description'
    } as ItemCategoryCreateRequest;

    const testDataUpdated = {
        parent_item_category_id: 0,
        key: 'cat_technology',
        name: 'Electronics and Technology',
        description: 'Electronics and Technology description'
    } as ItemCategoryUpdateRequest;

    const testDataNullKey = {
        parent_item_category_id: 0,
        name: 'nullkey1',
        description: 'nullkey1'
    } as ItemCategoryCreateRequest;

    const testDataChild = {
        parent_item_category_id: 0,
        key: 'cat_computer_systems_parts',
        name: 'Computer Systems and Parts',
        description: 'Computer Systems and Parts description'
    } as ItemCategoryCreateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemCategoryService = app.IoC.getNamed<ItemCategoryService>(Types.Service, Targets.Service.model.ItemCategoryService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean(false);

        // get default profile + market
        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());


    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no name of ItemCategory', async () => {
        expect.assertions(1);
        await itemCategoryService.create({
            parent_item_category_id: 0,
            key: 'cat_ele',
            description: 'Electronics',
            market: defaultMarket.receiveAddress
        } as ItemCategoryCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a root ItemCategory', async () => {
        const result: resources.ItemCategory = await itemCategoryService.create(rootData).then(value => value.toJSON());
        rootId = result.id;

        expect(result.name).toBe(rootData.name);
        expect(result.description).toBe(rootData.description);
    });

    test('Should create a new ItemCategory', async () => {
        testData.parent_item_category_id = rootId;
        testData.market = defaultMarket.receiveAddress;
        const result: resources.ItemCategory = await itemCategoryService.create(testData).then(value => value.toJSON());
        createdId = result.id;

        expect(result.name).toBe(testData.name);
        expect(result.description).toBe(testData.description);
    });

    test('Should create a new child ItemCategory', async () => {
        testDataChild.parent_item_category_id = createdId;
        testDataChild.market = defaultMarket.receiveAddress;
        const result: resources.ItemCategory = await itemCategoryService.create(testDataChild).then(value => value.toJSON());
        createdIdChild = result.id;

        expect(result.name).toBe(testDataChild.name);
        expect(result.description).toBe(testDataChild.description);
        expect(result.ParentItemCategory.id).toBe(testDataChild['parent_item_category_id']);
        expect(result.ParentItemCategory.ParentItemCategory.id).toBe(testData['parent_item_category_id']);
    });

    test('Should throw ValidationException because we want to create a empty ItemCategory', async () => {
        expect.assertions(1);
        await itemCategoryService.create({} as ItemCategoryCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should return one ItemCategory', async () => {
        const result: resources.ItemCategory = await itemCategoryService.findOne(createdId).then(value => value.toJSON());

        expect(result.name).toBe(testData.name);
        expect(result.description).toBe(testData.description);
    });

    test('Should update the ItemCategory', async () => {
        const result: resources.ItemCategory = await itemCategoryService.update(createdId, testDataUpdated).then(value => value.toJSON());

        expect(result.name).toBe(testDataUpdated.name);
        expect(result.description).toBe(testDataUpdated.description);
    });

    test('Should delete the ItemCategory', async () => {
        expect.assertions(4);
        await itemCategoryService.destroy(createdIdChild);
        await itemCategoryService.findOne(createdIdChild).catch(e =>
            expect(e).toEqual(new NotFoundException(createdIdChild))
        );

        await itemCategoryService.destroy(createdId);
        await itemCategoryService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        await itemCategoryService.destroy(rootId);
        await itemCategoryService.findOne(rootId).catch(e =>
            expect(e).toEqual(new NotFoundException(rootId))
        );

        const itemCategories: resources.ItemCategory[] = await itemCategoryService.findAll().then(value => value.toJSON());
        expect(itemCategories.length).toBe(0);
    }, 600000); // timeout to 600s

});
