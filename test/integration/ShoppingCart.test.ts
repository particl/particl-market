import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShoppingCart } from '../../src/api/models/ShoppingCart';

import { ShoppingCartService } from '../../src/api/services/ShoppingCartService';
import { ProfileService } from '../../src/api/services/ProfileService';

import { ShoppingCartCreateRequest } from '../../src/api/requests/ShoppingCartCreateRequest';
import { ShoppingCartUpdateRequest } from '../../src/api/requests/ShoppingCartUpdateRequest';
import * as resources from 'resources';

describe('ShoppingCart', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shoppingCartService: ShoppingCartService;
    let profileService: ProfileService;

    let defaultProfile: resources.Profile;
    let createdId;

    const testData = {
        name: 'test shopping cart',
        profile_id: 0
    } as ShoppingCartCreateRequest;

    const testDataUpdated = {
        name: 'Updated shopping cart'
    } as ShoppingCartUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shoppingCartService = app.IoC.getNamed<ShoppingCartService>(Types.Service, Targets.Service.ShoppingCartService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

    });

    afterAll(async () => {
        //
    });

    test('Should list default ShoppingCarts', async () => {
        const shoppingCartCollection = await shoppingCartService.findAll();
        const shoppingCart = shoppingCartCollection.toJSON();
        expect(shoppingCart.length).toBe(1);

        const result = shoppingCart[0];

        // test the values
        expect(result.name).toBe('DEFAULT');
        expect(result.profileId).toBe(defaultProfile.id);
    });

    test('Should create a new ShoppingCart', async () => {
        testData.profile_id = defaultProfile.id;
        const shoppingCartModel: ShoppingCart = await shoppingCartService.create(testData);
        createdId = shoppingCartModel.Id;

        const result = shoppingCartModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    test('Should throw ValidationException because we want to create a empty ShoppingCart', async () => {
        expect.assertions(1);
        await shoppingCartService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list ShoppingCarts with our new create one', async () => {
        const shoppingCartCollection = await shoppingCartService.findAll();
        const shoppingCarts = shoppingCartCollection.toJSON();
        expect(shoppingCarts.length).toBe(2); // includes default one

        const result = shoppingCarts[1];

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    test('Should return one ShoppingCart', async () => {
        const shoppingCartModel: ShoppingCart = await shoppingCartService.findOne(createdId);
        const result = shoppingCartModel.toJSON();

        // test the values
        expect(result.name).toBe(testData.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await shoppingCartService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the ShoppingCart', async () => {
        const shoppingCartsModel: ShoppingCart = await shoppingCartService.update(createdId, testDataUpdated);
        const result = shoppingCartsModel.toJSON();

        // test the values
        expect(result.name).toBe(testDataUpdated.name);
        expect(result.profileId).toBe(testData.profile_id);
    });

    test('Should delete the ShoppingCart', async () => {
        expect.assertions(1);
        await shoppingCartService.destroy(createdId);
        await shoppingCartService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
