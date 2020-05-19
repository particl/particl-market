// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
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
import { DefaultMarketService } from '../../src/api/services/DefaultMarketService';
import { hash } from 'omp-lib/dist/hasher/hash';

describe('ItemCategory', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let defaultMarketService: DefaultMarketService;
    let itemCategoryService: ItemCategoryService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let profile: resources.Profile;
    let market: resources.Market;

    let defaultRootCategory: resources.ItemCategory;

    let rootCategory: resources.ItemCategory;
    let childCategory: resources.ItemCategory;
    let childChildCategory: resources.ItemCategory;

    const rootData = {
        name: 'ROOT',
        description: 'root'
    } as ItemCategoryCreateRequest;

    const childData = {
        name: Faker.random.words(3),
        description: Faker.random.words(10)
    } as ItemCategoryCreateRequest;

    const childChildData = {
        name: Faker.random.words(3),
        description: Faker.random.words(10)
    } as ItemCategoryCreateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        defaultMarketService = app.IoC.getNamed<DefaultMarketService>(Types.Service, Targets.Service.DefaultMarketService);
        itemCategoryService = app.IoC.getNamed<ItemCategoryService>(Types.Service, Targets.Service.model.ItemCategoryService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

        // get default profile + market
        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await defaultMarketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        defaultRootCategory = await itemCategoryService.findRoot().then(value => value.toJSON());

        // custom root hash/name should match the default root
        rootData.name = defaultRootCategory.name;

        // create correct keys
        rootData.key = hash([rootData.name].toString());
        childData.key = hash([rootData.name, childData.name].toString());
        childChildData.key = hash([rootData.name, childData.name, childChildData.name].toString());

        // add correct market
        rootData.market = market.receiveAddress;
        childData.market = market.receiveAddress;
        childChildData.market = market.receiveAddress;

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty ItemCategory', async () => {
        expect.assertions(1);
        await itemCategoryService.create({} as ItemCategoryCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because missing name', async () => {
        expect.assertions(1);

        const createRequest = {
            description: Faker.random.words(30),
            market: market.receiveAddress,
            key: Faker.random.uuid()
        } as ItemCategoryCreateRequest;

        await itemCategoryService.create(createRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because missing key', async () => {
        expect.assertions(1);

        const createRequest = {
            name: Faker.random.words(3),
            description: Faker.random.words(30),
            market: market.receiveAddress
        } as ItemCategoryCreateRequest;

        await itemCategoryService.create(createRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a root ItemCategory', async () => {
        const result: resources.ItemCategory = await itemCategoryService.create(rootData).then(value => value.toJSON());
        expect(result.name).toBe(rootData.name);
        expect(result.description).toBe(rootData.description);
        expect(result.key).toBe(rootData.key);
        expect(result.market).toBe(rootData.market);
        rootCategory = result;
    });

    test('Should create a new child ItemCategory', async () => {
        childData.parent_item_category_id = rootCategory.id;
        const result: resources.ItemCategory = await itemCategoryService.create(childData).then(value => value.toJSON());
        expect(result.name).toBe(childData.name);
        expect(result.description).toBe(childData.description);
        expect(result.key).toBe(childData.key);
        expect(result.market).toBe(childData.market);
        childCategory = result;
    });

    test('Should create a childs child ItemCategory', async () => {
        childChildData.parent_item_category_id = childCategory.id;
        const result: resources.ItemCategory = await itemCategoryService.create(childChildData).then(value => value.toJSON());
        expect(result.name).toBe(childChildData.name);
        expect(result.description).toBe(childChildData.description);
        expect(result.key).toBe(childChildData.key);
        expect(result.market).toBe(childChildData.market);
        expect(result.ParentItemCategory.id).toBe(childChildData.parent_item_category_id);
        expect(result.ParentItemCategory.ParentItemCategory.id).toBe(childData.parent_item_category_id);
        childChildCategory = result;
    });

    test('Should return one ItemCategory', async () => {
        const result: resources.ItemCategory = await itemCategoryService.findOne(childCategory.id).then(value => value.toJSON());
        expect(result.name).toBe(childData.name);
        expect(result.description).toBe(childData.description);
        expect(result.key).toBe(childData.key);
        expect(result.market).toBe(childData.market);
    });

    test('Should find one by key and market', async () => {
        const result: resources.ItemCategory = await itemCategoryService.findOneByKeyAndMarket(rootCategory.key, market.receiveAddress)
            .then(value => value.toJSON());
        expect(result.name).toBe(rootCategory.name);
        expect(result.description).toBe(rootCategory.description);
        expect(result.market).toBe(rootCategory.market);
        expect(result.key).toBe(rootCategory.key);

        rootCategory = result;
    });

    test('Should find one default by key', async () => {
        const result: resources.ItemCategory = await itemCategoryService.findOneDefaultByKey(rootCategory.key).then(value => value.toJSON());
        expect(result.name).toBe(defaultRootCategory.name);
        expect(result.description).toBe(defaultRootCategory.description);
        expect(result.market).toBe(defaultRootCategory.market);
        expect(result.key).toBe(defaultRootCategory.key);

        expect(rootCategory.key).toBe(defaultRootCategory.key);

        defaultRootCategory = result;
    });

    test('Should update the ItemCategory', async () => {
        const updateRequest = {
            name: Faker.random.words(3),
            description: Faker.random.words(30)
        } as ItemCategoryUpdateRequest;

        updateRequest.key = hash([rootData.name, childData.name, updateRequest.name].toString());

        const result: resources.ItemCategory = await itemCategoryService.update(childChildCategory.id, updateRequest).then(value => value.toJSON());

        expect(result.name).toBe(updateRequest.name);
        expect(result.description).toBe(updateRequest.description);
        expect(result.key).toBe(updateRequest.key);
    });

    test('Should delete the ItemCategory', async () => {
        expect.assertions(4);
        await itemCategoryService.destroy(childChildCategory.id);
        await itemCategoryService.findOne(childChildCategory.id).catch(e =>
            expect(e).toEqual(new NotFoundException(childChildCategory.id))
        );

        await itemCategoryService.destroy(childCategory.id);
        await itemCategoryService.findOne(childCategory.id).catch(e =>
            expect(e).toEqual(new NotFoundException(childCategory.id))
        );

        await itemCategoryService.destroy(rootCategory.id);
        await itemCategoryService.findOne(rootCategory.id).catch(e =>
            expect(e).toEqual(new NotFoundException(rootCategory.id))
        );

        const itemCategories: resources.ItemCategory[] = await itemCategoryService.findAll().then(value => value.toJSON());
        expect(itemCategories.length).toBe(89);
    }, 600000); // timeout to 600s

});
