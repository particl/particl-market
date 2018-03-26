import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ListingItemObjectData } from '../../src/api/models/ListingItemObjectData';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';

import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';

import { ListingItemObjectDataService } from '../../src/api/services/ListingItemObjectDataService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';

import { HashableObjectType } from '../../src/api/enums/HashableObjectType';
import { ObjectHashService } from '../../src/api/services/ObjectHashService';

import { ListingItemObjectDataCreateRequest } from '../../src/api/requests/ListingItemObjectDataCreateRequest';
import { ListingItemObjectDataUpdateRequest } from '../../src/api/requests/ListingItemObjectDataUpdateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';

import * as listingItemTemplateCreateRequestBasic1 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic1.json';


describe('ListingItemObjectData', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemObjectDataService: ListingItemObjectDataService;
    let profileService: ProfileService;
    let listingItemTemplateService: ListingItemTemplateService;
    let objectHashService: ObjectHashService;

    let createdId;
    let createdListingItemObject;

    const testData = {
        key: 'Screensize',
        value: '17.8 inch',
        listing_item_object_id: null
    } as ListingItemObjectDataCreateRequest;

    const testDataUpdated = {
        key: 'gpu',
        value: 'NVidia 950',
        listing_item_object_id: null
    } as ListingItemObjectDataUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemObjectDataService = app.IoC.getNamed<ListingItemObjectDataService>(Types.Service, Targets.Service.ListingItemObjectDataService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        objectHashService = app.IoC.getNamed<ObjectHashService>(Types.Service, Targets.Service.ObjectHashService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const defaultProfile = await profileService.getDefault();
        const templateData = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic1));
        templateData.hash = await this.objectHashService.getHash(templateData, HashableObjectType.LISTINGITEMTEMPLATE);
        templateData.profile_id = defaultProfile.Id;

        const createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: 'listingitemtemplate',
            data: templateData,
            withRelated: true
        } as TestDataCreateRequest);
        createdListingItemObject = createdListingItemTemplate.toJSON().ListingItemObjects[0];

    });

    afterAll(async () => {
        //
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await listingItemObjectDataService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */
    test('Should create a new listing item object data', async () => {
        testData.listing_item_object_id = createdListingItemObject.id;

        const listingItemObjectDataModel: ListingItemObjectData = await listingItemObjectDataService.create(testData);

        const result = listingItemObjectDataModel.toJSON();
        createdId = listingItemObjectDataModel.Id;

        // test the values
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
        expect(result.listingItemObjectId).toBe(testData.listing_item_object_id);
    });

    test('Should throw ValidationException because we want to create a empty listing item object data', async () => {
        expect.assertions(1);
        await listingItemObjectDataService.create({} as ListingItemObjectDataCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list listing item object datas with our new create one', async () => {
        const listingItemObjectDataCollection = await listingItemObjectDataService.findAll();
        const listingItemObjectData = listingItemObjectDataCollection.toJSON();
        expect(listingItemObjectData.length).toBe(7); // 6 alredy exist

        const result = listingItemObjectData[6];

        // test the values
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
        expect(result.listingItemObjectId).toBe(testData.listing_item_object_id);
    });

    test('Should return one listing item object data', async () => {
        const listingItemObjectDataModel: ListingItemObjectData = await listingItemObjectDataService.findOne(createdId);
        const result = listingItemObjectDataModel.toJSON();

        // test the values
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
        expect(result.listingItemObjectId).toBe(testData.listing_item_object_id);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await listingItemObjectDataService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the listing item object data', async () => {
        testDataUpdated.listing_item_object_id = createdListingItemObject.id;
        const listingItemObjectDataModel: ListingItemObjectData = await listingItemObjectDataService.update(createdId, testDataUpdated);
        const result = listingItemObjectDataModel.toJSON();
        // expect(result).toBe(1);
        // test the values
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
        expect(result.listingItemObjectId).toBe(testDataUpdated.listing_item_object_id);
    });

    test('Should delete the listing item object data', async () => {
        expect.assertions(1);
        await listingItemObjectDataService.destroy(createdId);
        await listingItemObjectDataService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
