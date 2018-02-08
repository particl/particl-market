import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';

import { TestDataService } from '../../src/api/services/TestDataService';
import { ShippingPriceService } from '../../src/api/services/ShippingPriceService';
import { ProfileService } from '../../src/api/services/ProfileService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShippingPrice } from '../../src/api/models/ShippingPrice';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';

import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { ShippingPriceCreateRequest } from '../../src/api/requests/ShippingPriceCreateRequest';
import { ShippingPriceUpdateRequest } from '../../src/api/requests/ShippingPriceUpdateRequest';

import { PaymentType } from '../../src/api/enums/PaymentType';
import { Currency } from '../../src/api/enums/Currency';

describe('ShippingPrice', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shippingPriceService: ShippingPriceService;
    let profileService: ProfileService;

    let createdId;
    let itemPriceId;

    const testData = {
        domestic: 2.12,
        international: 4.2
    };

    const testDataUpdated = {
        domestic: 1.2,
        international: 3.4
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shippingPriceService = app.IoC.getNamed<ShippingPriceService>(Types.Service, Targets.Service.ShippingPriceService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        const defaultProfile = await profileService.getDefault();
        const createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: 'listingitemtemplate',
            data: {
                profile_id: defaultProfile.Id,
                hash: 'itemhash',
                paymentInformation: {
                    type: PaymentType.FREE,
                    itemPrice: {
                        currency: Currency.PARTICL,
                        basePrice: 3.333
                    }
                }
            } as any,
            withRelated: true
        } as TestDataCreateRequest);
        itemPriceId = createdListingItemTemplate.toJSON().PaymentInformation.ItemPrice.id;
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_price_id', async () => {
        expect.assertions(1);
        await shippingPriceService.create(testData as ShippingPriceCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new shipping price', async () => {
        testData['item_price_id'] = itemPriceId;
        const shippingPriceModel: ShippingPrice = await shippingPriceService.create(testData as ShippingPriceCreateRequest);
        createdId = shippingPriceModel.Id;

        const result = shippingPriceModel.toJSON();
        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('Should throw ValidationException because we want to create a empty shipping price', async () => {
        expect.assertions(1);
        await shippingPriceService.create({} as ShippingPriceCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shipping prices with our new create one', async () => {
        const shippingPriceCollection = await shippingPriceService.findAll();
        const shippingPrice = shippingPriceCollection.toJSON();
        expect(shippingPrice.length).toBe(1);

        const result = shippingPrice[0];

        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('Should return one shipping price', async () => {
        const shippingPriceModel: ShippingPrice = await shippingPriceService.findOne(createdId);
        const result = shippingPriceModel.toJSON();

        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('Should throw ValidationException because there is no item_price_id', async () => {
        expect.assertions(1);
        await shippingPriceService.update(createdId, testDataUpdated as ShippingPriceUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the shipping price', async () => {
        testDataUpdated['item_price_id'] = itemPriceId;
        const shippingPriceModel: ShippingPrice = await shippingPriceService.update(createdId, testDataUpdated as ShippingPriceUpdateRequest);
        const result = shippingPriceModel.toJSON();

        expect(result.domestic).toBe(testDataUpdated.domestic);
        expect(result.international).toBe(testDataUpdated.international);
    });

    test('Should delete the shipping price', async () => {
        expect.assertions(1);
        await shippingPriceService.destroy(createdId);
        await shippingPriceService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
