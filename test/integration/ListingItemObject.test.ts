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
import { ProfileService } from '../../src/api/services/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { ListingItemObjectService } from '../../src/api/services/ListingItemObjectService';
import { ListingItemObjectDataService } from '../../src/api/services/ListingItemObjectDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ListingItemObject } from '../../src/api/models/ListingItemObject';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';
import { ListingItemObjectCreateRequest } from '../../src/api/requests/ListingItemObjectCreateRequest';
import { ListingItemObjectUpdateRequest } from '../../src/api/requests/ListingItemObjectUpdateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { MarketService } from '../../src/api/services/MarketService';

describe('ListingItemObject', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemObjectService: ListingItemObjectService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemTemplateService: ListingItemTemplateService;
    let listingItemObjectDataService: ListingItemObjectDataService;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdListingItemObject: resources.ListingItemObject;

    const testData = {
        type: ListingItemObjectType.DROPDOWN,
        description: 'where to store the dropdown data...',
        order: 0,
        listingItemObjectDatas: [
            {
                key: 'gps',
                value: 'NVIDIA 500'
            }
        ]
    } as ListingItemObjectCreateRequest;

    const testDataUpdated = {
        type: ListingItemObjectType.TABLE,
        description: 'table desc',
        order: 1
    } as ListingItemObjectUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemObjectService = app.IoC.getNamed<ListingItemObjectService>(Types.Service, Targets.Service.ListingItemObjectService);
        listingItemObjectDataService = app.IoC.getNamed<ListingItemObjectDataService>(Types.Service, Targets.Service.ListingItemObjectDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // get market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        // generate template
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
                true,               // generateItemInformation
                true,               // generateItemLocation
                true,               // generateShippingDestinations
                false,              // generateItemImages
                true,               // generatePaymentInformation
                true,               // generateEscrow
                true,               // generateItemPrice
                true,               // generateMessagingInformation
                false,              // generateListingItemObjects
                false,              // generateObjectDatas
                defaultProfile.id,  // profileId
                false,              // generateListingItem
                defaultMarket.id    // marketId
            ]).toParamsArray();

        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,  // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemTemplateParams // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItemTemplate = listingItemTemplates[0];

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty messaging information', async () => {
        expect.assertions(1);
        await listingItemObjectService.create({} as ListingItemObjectCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ListingItemObject', async () => {
        testData.listing_item_template_id = createdListingItemTemplate.id;

        const listingItemObjectModel: ListingItemObject = await listingItemObjectService.create(testData);
        createdListingItemObject = listingItemObjectModel.toJSON();
        const result = createdListingItemObject;

        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
        expect(result.order).toBe(testData.order);
        expect(result.forceInput).toBe(0);
        expect(result.objectId).toBeNull();

        expect(result.ListingItemObjectDatas[0].key).toBe(testData.listingItemObjectDatas[0].key);
        expect(result.ListingItemObjectDatas[0].value).toBe(testData.listingItemObjectDatas[0].value);
    });

    test('Should throw ValidationException because we want to create a empty ListingItemObject', async () => {
        expect.assertions(1);
        await listingItemObjectService.create({} as ListingItemObjectCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list all ListingItemObjects with our new create one', async () => {
        const listingItemObjectCollection = await listingItemObjectService.findAll();
        const listingItemObjects = listingItemObjectCollection.toJSON();
        expect(listingItemObjects.length).toBe(1);

        const result = listingItemObjects[0];

        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
        expect(result.order).toBe(testData.order);
        expect(result.forceInput).toBe(0);
        expect(result.objectId).toBeNull();
    });

    test('Should return one ListingItemObject', async () => {
        const listingItemObjectModel: ListingItemObject = await listingItemObjectService.findOne(createdListingItemObject.id);
        const result = listingItemObjectModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
        expect(result.order).toBe(testData.order);
        expect(result.forceInput).toBe(0);
        expect(result.objectId).toBeNull();
        expect(result.ListingItemObjectDatas[0].key).toBe(testData.listingItemObjectDatas[0].key);
        expect(result.ListingItemObjectDatas[0].value).toBe(testData.listingItemObjectDatas[0].value);
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await listingItemObjectService.update(createdListingItemObject.id, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the ListingItemObject', async () => {
        testDataUpdated.listing_item_template_id = createdListingItemTemplate.id;
        const listingItemObjectModel: ListingItemObject = await listingItemObjectService.update(createdListingItemObject.id, testDataUpdated);
        const result = listingItemObjectModel.toJSON();

        expect(result.type).toBe(testDataUpdated.type);
        expect(result.description).toBe(testDataUpdated.description);
        expect(result.order).toBe(testDataUpdated.order);
    });

    test('Should delete the ListingItemObject', async () => {
        const dataObjectId = createdListingItemObject.ListingItemObjectDatas[0].id;

        expect.assertions(3);
        await listingItemObjectService.destroy(createdListingItemObject.id);
        await listingItemObjectService.findOne(createdListingItemObject.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemObject.id))
        );

        await listingItemObjectDataService.findOne(dataObjectId).catch(e =>
           expect(e).toEqual(new NotFoundException(dataObjectId))
        );

        // delete also the ListingItemTemplate
        await listingItemTemplateService.destroy(createdListingItemTemplate.id);
        await listingItemTemplateService.findOne(createdListingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemTemplate.id))
        );
    });

});
