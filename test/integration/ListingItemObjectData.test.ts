// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ListingItemObjectDataService } from '../../src/api/services/model/ListingItemObjectDataService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ListingItemObjectDataCreateRequest } from '../../src/api/requests/model/ListingItemObjectDataCreateRequest';
import { ListingItemObjectDataUpdateRequest } from '../../src/api/requests/model/ListingItemObjectDataUpdateRequest';
import { MarketService } from '../../src/api/services/model/MarketService';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { ListingItemObjectService } from '../../src/api/services/model/ListingItemObjectService';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';
import { ListingItemObjectCreateRequest } from '../../src/api/requests/model/ListingItemObjectCreateRequest';

describe('ListingItemObjectData', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemObjectDataService: ListingItemObjectDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemObjectService: ListingItemObjectService;
    let listingItemTemplateService: ListingItemTemplateService;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItemObject: resources.ListingItemObject;
    let listingItemObjectData: resources.ListingItemObjectData;

    const testData = {
        key: 'Screensize',
        value: '17.8 inch'
    } as ListingItemObjectDataCreateRequest;

    const testDataUpdated = {
        key: 'gpu',
        value: 'NVidia 950'
    } as ListingItemObjectDataUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemObjectService = app.IoC.getNamed<ListingItemObjectService>(Types.Service, Targets.Service.model.ListingItemObjectService);
        listingItemObjectDataService = app.IoC.getNamed<ListingItemObjectDataService>(Types.Service, Targets.Service.model.ListingItemObjectDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile + market
        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        // generate template
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            false,      // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            false,      // generateEscrow
            false,      // generateItemPrice
            true,       // generateMessagingInformation
            false,      // generateListingItemObjects
            false,      // generateObjectDatas
            profile.id, // profileId
            false,      // generateListingItem
            market.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,  // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateListingItemTemplateParams // what kind of data to generate
        } as TestDataGenerateRequest);
        listingItemTemplate = listingItemTemplates[0];

        // create ListingItemObject
        const listingItemObjectCreateRequest = {
            listing_item_template_id: listingItemTemplate.id,
            type: ListingItemObjectType.DROPDOWN,
            description: 'where to store the dropdown data...',
            order: 0
        } as ListingItemObjectCreateRequest;

        listingItemObject = await listingItemObjectService.create(listingItemObjectCreateRequest).then(value => value.toJSON());

    });

    afterAll(async () => {
        //
    });


    test('Should create a new ListingItemObjectData', async () => {

        testData.listing_item_object_id = listingItemObject.id;
        listingItemObjectData = await listingItemObjectDataService.create(testData).then(value => value.toJSON());

        const result: resources.ListingItemObjectData = listingItemObjectData;
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
        expect(result.listingItemObjectId).toBe(testData.listing_item_object_id);
    });

    test('Should throw ValidationException because we want to create a empty ListingItemObjectData', async () => {
        expect.assertions(1);
        await listingItemObjectDataService.create({} as ListingItemObjectDataCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list ListingItemObjectDatas with our new create one', async () => {
        const listingItemObjectDatas: resources.ListingItemObjectData[] = await listingItemObjectDataService.findAll().then(value => value.toJSON());
        expect(listingItemObjectDatas.length).toBe(1);

        const result: resources.ListingItemObjectData = listingItemObjectDatas[0];
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
        expect(result.listingItemObjectId).toBe(testData.listing_item_object_id);
    });

    test('Should return one ListingItemObjectData', async () => {
        listingItemObjectData = await listingItemObjectDataService.findOne(listingItemObjectData.id).then(value => value.toJSON());

        const result: resources.ListingItemObjectData = listingItemObjectData;
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
        expect(result.listingItemObjectId).toBe(testData.listing_item_object_id);
    });

    test('Should update the ListingItemObjectData', async () => {
        testDataUpdated.listing_item_object_id = listingItemObject.id;
        listingItemObjectData = await listingItemObjectDataService.update(listingItemObjectData.id, testDataUpdated)
            .then(value => value.toJSON());

        const result: resources.ListingItemObjectData = listingItemObjectData;
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
        expect(result.listingItemObjectId).toBe(testDataUpdated.listing_item_object_id);
    });

    test('Should delete the listing item object data', async () => {
        expect.assertions(1);
        await listingItemObjectDataService.destroy(listingItemObjectData.id);
        await listingItemObjectDataService.findOne(listingItemObjectData.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemObjectData.id))
        );
    });

});
