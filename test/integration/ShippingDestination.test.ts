import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShippingDestination } from '../../src/api/models/ShippingDestination';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';

import { ShippingDestinationService } from '../../src/api/services/ShippingDestinationService';

import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { ItemInformationService } from '../../src/api/services/ItemInformationService';
import { ShippingDestinationCreateRequest } from '../../src/api/requests/ShippingDestinationCreateRequest';
import { ShippingDestinationUpdateRequest } from '../../src/api/requests/ShippingDestinationUpdateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';

describe('ShippingDestination', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shippingDestinationService: ShippingDestinationService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let itemInformationService: ItemInformationService;

    let createdId;

    let listingItem;

    let defaultMarket;

    const testData = {
        item_information_id: null,
        country: 'United Kingdom',
        shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
    } as ShippingDestinationCreateRequest;

    const testDataUpdated = {
        country: 'EU',
        shippingAvailability: ShippingAvailability.SHIPS
    } as ShippingDestinationUpdateRequest;

    const listingItemData = {
        hash: 'hash1',
        market_id: 0,
        itemInformation: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            itemCategory: {
                key: 'cat_high_luxyry_items',
                name: 'Luxury Items',
                description: ''
            }
        }
        // TODO: ignoring listingitemobjects for now
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.ShippingDestinationService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

        defaultMarket = await marketService.getDefault();
        defaultMarket = defaultMarket.toJSON();
        listingItemData.market_id = defaultMarket.id;
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await shippingDestinationService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new shipping destination', async () => {
        listingItem = await testDataService.create({
            model: 'listingitem',
            withRelated: true,
            data: listingItemData
        } as TestDataCreateRequest);
        listingItem = listingItem.toJSON();
        testData.item_information_id = listingItem.ItemInformation.id;

        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.create(testData);
        createdId = shippingDestinationModel.Id;

        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should throw ValidationException because we want to create a empty shipping destination', async () => {
        expect.assertions(1);
        await shippingDestinationService.create({} as ShippingDestinationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shipping destinations with our new create one', async () => {
        const shippingDestinationCollection = await shippingDestinationService.findAll();
        const shippingDestination = shippingDestinationCollection.toJSON();
        expect(shippingDestination.length).toBe(1);

        const result = shippingDestination[0];

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should return one shipping destination', async () => {
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.findOne(createdId);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await shippingDestinationService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the shipping destination', async () => {
        testDataUpdated.item_information_id = listingItem.ItemInformation.id;
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.update(createdId, testDataUpdated);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testDataUpdated.country);
        expect(result.shippingAvailability).toBe(testDataUpdated.shippingAvailability);
    });

    test('Should delete the shipping destination', async () => {
        expect.assertions(3);
        await shippingDestinationService.destroy(createdId);
        await shippingDestinationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // delete listing-item and related stuffs
        await listingItemService.destroy(listingItem.id);
        await listingItemService.findOne(listingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.id))
        );

        await itemInformationService.findOne(listingItem.ItemInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.ItemInformation.id))
        );

    });

});
