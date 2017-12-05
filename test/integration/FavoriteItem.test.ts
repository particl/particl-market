import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { FavoriteItem } from '../../src/api/models/FavoriteItem';

import { FavoriteItemService } from '../../src/api/services/FavoriteItemService';
import { ProfileService } from '../../src/api/services/ProfileService';

describe('FavoriteItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let favoriteItemService: FavoriteItemService;
    let profileService: ProfileService;

    let createdId;
    let defaultProfile;
    const testData = {

    };

    const testDataUpdated = {

    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        favoriteItemService = app.IoC.getNamed<FavoriteItemService>(Types.Service, Targets.Service.FavoriteItemService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
        defaultProfile = await profileService.getDefault();
    });

    afterAll(async () => {
        //
    });


    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await favoriteItemService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new favorite item', async () => {
        testData['profile_id'] = defaultProfile.id;
        testData['listing_item_id'] = 1;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.create(testData);
        createdId = favoriteItemModel.Id;

        const result = favoriteItemModel.toJSON();
        // test the values
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(1);
    });

    test('Should throw ValidationException because we want to create a empty favorite item', async () => {
        expect.assertions(1);
        await favoriteItemService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list favorite items with our new create one', async () => {
        const favoriteItemCollection = await favoriteItemService.findAll();
        const favoriteItem = favoriteItemCollection.toJSON();
        expect(favoriteItem.length).toBe(1);

        const result = favoriteItem[0];

        // test the values
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(1);
    });

    test('Should return one favorite item', async () => {
        const favoriteItemModel: FavoriteItem = await favoriteItemService.findOne(createdId);
        const result = favoriteItemModel.toJSON();

        // test the values
        expect(result.profileId).toBe(defaultProfile.id);
        expect(result.listingItemId).toBe(1);
    });


    test('Should throw ValidationException because there is no profile_id', async () => {
        expect.assertions(1);
        await favoriteItemService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });


    test('Should update the favorite item', async () => {
        testDataUpdated['profile_id'] = defaultProfile.id;
        testDataUpdated['listing_item_id'] = 0;
        const favoriteItemModel: FavoriteItem = await favoriteItemService.update(createdId, testDataUpdated);
        const result = favoriteItemModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the favorite item', async () => {
        expect.assertions(1);
        await favoriteItemService.destroy(createdId);
        await favoriteItemService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
