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
import { ShippingPriceService } from '../../src/api/services/model/ShippingPriceService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { PaymentInformationService } from '../../src/api/services/model/PaymentInformationService';
import { EscrowService } from '../../src/api/services/model/EscrowService';
import { ItemPriceService } from '../../src/api/services/model/ItemPriceService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ShippingPriceCreateRequest } from '../../src/api/requests/model/ShippingPriceCreateRequest';
import { ShippingPriceUpdateRequest } from '../../src/api/requests/model/ShippingPriceUpdateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MarketService } from '../../src/api/services/model/MarketService';

describe('ShippingPrice', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let shippingPriceService: ShippingPriceService;
    let paymentInformationService: PaymentInformationService;
    let listingItemTemplateService: ListingItemTemplateService;
    let escrowService: EscrowService;
    let itemPriceService: ItemPriceService;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let shippingPrice: resources.ShippingPrice;

    const testData = {
        domestic: 2.12,
        international: 4.2
    } as ShippingPriceCreateRequest;

    const testDataUpdated = {
        domestic: 1.2,
        international: 3.4
    } as ShippingPriceUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shippingPriceService = app.IoC.getNamed<ShippingPriceService>(Types.Service, Targets.Service.model.ShippingPriceService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.model.PaymentInformationService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.model.EscrowService);
        itemPriceService = app.IoC.getNamed<ItemPriceService>(Types.Service, Targets.Service.model.ItemPriceService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile + market
        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        const templateGenerateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            false,      // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            false,       // generateEscrow
            true,       // generateItemPrice
            false,      // generateMessagingInformation
            false,      // generateListingItemObjects
            false,      // generateObjectDatas
            profile.id, // profileId
            false,       // generateListingItem
            market.id   // marketId
        ]);

        const generateParams = templateGenerateParams.toParamsArray();
        const templates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams
        } as TestDataGenerateRequest);
        listingItemTemplate = templates[0];

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

    test('Should create a new ShippingPrice', async () => {
        testData.item_price_id = listingItemTemplate.PaymentInformation.ItemPrice.id;

        shippingPrice = await shippingPriceService.create(testData).then(value => value.toJSON());

        const result: resources.ShippingPrice = shippingPrice;
        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('Should throw ValidationException because we want to create a empty ShippingPrice', async () => {
        expect.assertions(1);
        await shippingPriceService.create({} as ShippingPriceCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list ShippingPrices with our new create one', async () => {
        const shippingPrices: resources.ShippingPrice[] = await shippingPriceService.findAll().then(value => value.toJSON());
        expect(shippingPrices.length).toBe(2);   // template + new one

        const result = shippingPrices[1];

        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('Should return one ShippingPrice', async () => {
        shippingPrice = await shippingPriceService.findOne(shippingPrice.id).then(value => value.toJSON());
        const result: resources.ShippingPrice = shippingPrice;

        expect(result.domestic).toBe(testData.domestic);
        expect(result.international).toBe(testData.international);
    });

    test('Should throw ValidationException because there is no item_price_id', async () => {
        expect.assertions(1);
        await shippingPriceService.update(shippingPrice.id, testDataUpdated as ShippingPriceUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the ShippingPrice', async () => {
        testDataUpdated.item_price_id = listingItemTemplate.PaymentInformation.ItemPrice.id;
        shippingPrice = await shippingPriceService.update(shippingPrice.id, testDataUpdated).then(value => value.toJSON());
        const result: resources.ShippingPrice = shippingPrice;

        expect(result.domestic).toBe(testDataUpdated.domestic);
        expect(result.international).toBe(testDataUpdated.international);
    });

    test('Should delete the ShippingPrice', async () => {
        expect.assertions(4);
        await shippingPriceService.destroy(shippingPrice.id);
        await shippingPriceService.findOne(shippingPrice.id).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPrice.id))
        );

        // delete listing-item-template
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await listingItemTemplateService.findOne(listingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemTemplate.id))
        );

        const paymentInformation = listingItemTemplate.PaymentInformation;
        // payment information
        await paymentInformationService.findOne(paymentInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(paymentInformation.id))
        );

        // findout itemPrice
        await itemPriceService.findOne(paymentInformation.ItemPrice.id).catch(e =>
            expect(e).toEqual(new NotFoundException(paymentInformation.ItemPrice.id))
        );
    });

});
