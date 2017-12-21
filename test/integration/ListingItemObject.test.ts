import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ProfileService } from '../../src/api/services/ProfileService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ListingItemObject } from '../../src/api/models/ListingItemObject';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';

import { ListingItemObjectService } from '../../src/api/services/ListingItemObjectService';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { ListingItemObjectCreateRequest } from '../../src/api/requests/ListingItemObjectCreateRequest';
import { ListingItemObjectUpdateRequest } from '../../src/api/requests/ListingItemObjectUpdateRequest';

describe('ListingItemObject', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemObjectService: ListingItemObjectService;
    let profileService: ProfileService;

    let createdId;
    let createdListingItemTemplate;
    let defaultProfile;

    const testData = {
        type: ListingItemObjectType.DROPDOWN,
        description: 'where to store the dropdown data...',
        order: 0
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
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

        defaultProfile = await profileService.getDefault();
        createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: 'listingitemtemplate',
            data: {
                profile_id: defaultProfile.Id,
                hash: 'itemhash'
            },
            withRelated: true
        } as TestDataCreateRequest);

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty messaging information', async () => {
        expect.assertions(1);
        await listingItemObjectService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new listing item object', async () => {
        testData['listing_item_template_id'] = createdListingItemTemplate.Id;
        const listingItemObjectModel: ListingItemObject = await listingItemObjectService.create(testData);
        createdId = listingItemObjectModel.Id;

        const result = listingItemObjectModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
        expect(result.order).toBe(testData.order);
    });

    test('Should throw ValidationException because we want to create a empty listing item object', async () => {
        expect.assertions(1);
        await listingItemObjectService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list listing item objects with our new create one', async () => {
        const listingItemObjectCollection = await listingItemObjectService.findAll();
        const listingItemObject = listingItemObjectCollection.toJSON();
        expect(listingItemObject.length).toBe(1);

        const result = listingItemObject[0];

        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
        expect(result.order).toBe(testData.order);
    });

    test('Should return one listing item object', async () => {
        const listingItemObjectModel: ListingItemObject = await listingItemObjectService.findOne(createdId);
        const result = listingItemObjectModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.description).toBe(testData.description);
        expect(result.order).toBe(testData.order);
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await listingItemObjectService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the listing item object', async () => {
        testDataUpdated['listing_item_template_id'] = 0;
        const listingItemObjectModel: ListingItemObject = await listingItemObjectService.update(createdId, testDataUpdated);
        const result = listingItemObjectModel.toJSON();

        expect(result.type).toBe(testDataUpdated.type);
        expect(result.description).toBe(testDataUpdated.description);
        expect(result.order).toBe(testDataUpdated.order);
    });

    test('Should delete the listing item object', async () => {
        expect.assertions(1);
        await listingItemObjectService.destroy(createdId);
        await listingItemObjectService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
