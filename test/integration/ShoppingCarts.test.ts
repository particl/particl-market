import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShoppingCarts } from '../../src/api/models/ShoppingCarts';

import { ShoppingCartsService } from '../../src/api/services/ShoppingCartsService';
import { ProfileService } from '../../src/api/services/ProfileService';

import { ShoppingCartsCreateRequest } from '../../src/api/requests/ShoppingCartsCreateRequest';
import { ShoppingCartsUpdateRequest } from '../../src/api/requests/ShoppingCartsUpdateRequest';

describe('ShoppingCarts', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;
    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shoppingCartsService: ShoppingCartsService;
    let profileService: ProfileService;

    let defaultProfile;
    let createdId;

    const testData = {
        name: 'test shopping cart',
        profile_id: 0
    } as ShoppingCartsCreateRequest;

    const testDataUpdated = {
        name: 'Updated shopping cart'
    } as ShoppingCartsUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shoppingCartsService = app.IoC.getNamed<ShoppingCartsService>(Types.Service, Targets.Service.ShoppingCartsService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault();
    });

    afterAll(async () => {
        //
    });

    test('Should list default shopping carts', async () => {
        const shoppingCartsCollection = await shoppingCartsService.findAll();
        const shoppingCarts = shoppingCartsCollection.toJSON();
        expect(shoppingCarts.length).toBe(1);

        const result = shoppingCarts[0];

        // test the values
        expect(result.name).toBe('DEFAULT');
        expect(result.profileId).toBe(defaultProfile.id);
    });

    test('Should create a new shopping cart', async () => {
        testData.profile_id = defaultProfile.id;
        const shoppingCartsModel: ShoppingCarts = await shoppingCartsService.create(testData);
        createdId = shoppingCartsModel.Id;

        const result = shoppingCartsModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    test('Should throw ValidationException because we want to create a empty shopping cart', async () => {
        expect.assertions(1);
        await shoppingCartsService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shopping carts with our new create one', async () => {
        const shoppingCartsCollection = await shoppingCartsService.findAll();
        const shoppingCarts = shoppingCartsCollection.toJSON();
        expect(shoppingCarts.length).toBe(2); // includes default one

        const result = shoppingCarts[1];

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    test('Should return one shopping carts', async () => {
        const shoppingCartsModel: ShoppingCarts = await shoppingCartsService.findOne(createdId);
        const result = shoppingCartsModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await shoppingCartsService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the shopping carts', async () => {
        const shoppingCartsModel: ShoppingCarts = await shoppingCartsService.update(createdId, testDataUpdated);
        const result = shoppingCartsModel.toJSON();

        // test the values
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    test('Should delete the shopping carts', async () => {
        expect.assertions(1);
        await shoppingCartsService.destroy(createdId);
        await shoppingCartsService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
