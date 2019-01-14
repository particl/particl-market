// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ListingItemObjectData } from '../../src/api/models/ListingItemObjectData';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';
import { ListingItemObjectDataService } from '../../src/api/services/ListingItemObjectDataService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { HashableObjectType } from '../../src/api/enums/HashableObjectType';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { ListingItemObjectDataCreateRequest } from '../../src/api/requests/ListingItemObjectDataCreateRequest';
import { ListingItemObjectDataUpdateRequest } from '../../src/api/requests/ListingItemObjectDataUpdateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import * as listingItemTemplateCreateRequestBasic1 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic1.json';
import {MarketService} from '../../src/api/services/MarketService';
import * as resources from "resources";
import {GenerateListingItemTemplateParams} from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import {TestDataGenerateRequest} from '../../src/api/requests/TestDataGenerateRequest';
import {ListingItemObject} from '../../src/api/models/ListingItemObject';
import {ListingItemObjectService} from '../../src/api/services/ListingItemObjectService';
import {ListingItemObjectType} from '../../src/api/enums/ListingItemObjectType';
import {ListingItemObjectCreateRequest} from '../../src/api/requests/ListingItemObjectCreateRequest';

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

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdListingItemObject: resources.ListingItemObject;
    let createdListingItemObjectData: resources.ListingItemObjectData;

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

        const templateData = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic1));
        templateData.hash = ObjectHash.getHash(templateData, HashableObjectType.LISTINGITEMTEMPLATE_CREATEREQUEST);
        templateData.profile_id = defaultProfile.Id;

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

        // create ListingItemObject
        const listingItemObjectCreateRequest = {
            listing_item_template_id: createdListingItemTemplate.id,
            type: ListingItemObjectType.DROPDOWN,
            description: 'where to store the dropdown data...',
            order: 0
        } as ListingItemObjectCreateRequest;

        const listingItemObjectModel: ListingItemObject = await listingItemObjectService.create(listingItemObjectCreateRequest);
        createdListingItemObject = listingItemObjectModel.toJSON();

    });

    afterAll(async () => {
        //
    });


    test('Should create a new ListingItemObjectData', async () => {

        testData.listing_item_object_id = createdListingItemObject.id;
        const listingItemObjectDataModel: ListingItemObjectData = await listingItemObjectDataService.create(testData);
        createdListingItemObjectData = listingItemObjectDataModel.toJSON();

        const result = createdListingItemObjectData;
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
        const listingItemObjectDataCollection = await listingItemObjectDataService.findAll();
        const listingItemObjectDatas = listingItemObjectDataCollection.toJSON();
        expect(listingItemObjectDatas.length).toBe(1);

        const result = listingItemObjectDatas[0];
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
        expect(result.listingItemObjectId).toBe(testData.listing_item_object_id);
    });

    test('Should return one ListingItemObjectData', async () => {
        const listingItemObjectDataModel: ListingItemObjectData
            = await listingItemObjectDataService.findOne(createdListingItemObjectData.id);

        const result = listingItemObjectDataModel.toJSON();
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
        expect(result.listingItemObjectId).toBe(testData.listing_item_object_id);
    });

    test('Should update the ListingItemObjectData', async () => {
        testDataUpdated.listing_item_object_id = createdListingItemObject.id;
        const listingItemObjectDataModel: ListingItemObjectData
            = await listingItemObjectDataService.update(createdListingItemObjectData.id, testDataUpdated);

        const result = listingItemObjectDataModel.toJSON();
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
        expect(result.listingItemObjectId).toBe(testDataUpdated.listing_item_object_id);
    });

    test('Should delete the listing item object data', async () => {
        expect.assertions(1);
        await listingItemObjectDataService.destroy(createdListingItemObjectData.id);
        await listingItemObjectDataService.findOne(createdListingItemObjectData.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemObjectData.id))
        );
    });

});
