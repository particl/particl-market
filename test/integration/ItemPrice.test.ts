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
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { PaymentInformationService } from '../../src/api/services/model/PaymentInformationService';
import { EscrowService } from '../../src/api/services/model/EscrowService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { ItemPriceService } from '../../src/api/services/model/ItemPriceService';
import { ItemPriceCreateRequest } from '../../src/api/requests/model/ItemPriceCreateRequest';
import { ItemPriceUpdateRequest } from '../../src/api/requests/model/ItemPriceUpdateRequest';
import { CryptoAddressType, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ShippingPriceCreateRequest } from '../../src/api/requests/model/ShippingPriceCreateRequest';
import { CryptocurrencyAddressCreateRequest } from '../../src/api/requests/model/CryptocurrencyAddressCreateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { ShippingPriceUpdateRequest } from '../../src/api/requests/model/ShippingPriceUpdateRequest';
import { CryptocurrencyAddressUpdateRequest } from '../../src/api/requests/model/CryptocurrencyAddressUpdateRequest';

describe('ItemPrice', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemPriceService: ItemPriceService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;
    let paymentInformationService: PaymentInformationService;
    let escrowService: EscrowService;

    let itemPrice: resources.ItemPrice;
    let listingItemTemplate: resources.ListingItemTemplate;
    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemPriceService = app.IoC.getNamed<ItemPriceService>(Types.Service, Targets.Service.model.ItemPriceService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.model.PaymentInformationService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.model.EscrowService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            false,              // generateItemImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            false,               // generateItemPrice
            true,               // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            defaultProfile.id,  // profileId
            true,               // generateListingItem
            defaultMarket.id    // marketId
        ]).toParamsArray();

        // generate two ListingItemTemplates with ListingItems
        const listingItemTemplates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,          // what to generate
            amount: 1,                                          // how many to generate
            withRelated: true,                                  // return model
            generateParams: generateListingItemTemplateParams   // what kind of data to generate
        } as TestDataGenerateRequest);

        listingItemTemplate = listingItemTemplates[0];
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because we want to create a empty ItemPrice', async () => {
        expect.assertions(1);
        await itemPriceService.create({} as ItemPriceCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because there is no payment_information_id', async () => {
        expect.assertions(1);

        const testData = {
            basePrice: 1,
            shippingPrice: {
                domestic: 2,
                international: 3
            } as ShippingPriceCreateRequest,
            cryptocurrencyAddress: {
                type: CryptoAddressType.NORMAL,
                address: '1234'
            } as CryptocurrencyAddressCreateRequest
        } as ItemPriceCreateRequest;

        await itemPriceService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because there is no currency', async () => {
        expect.assertions(1);

        const testData = {
            payment_information_id: listingItemTemplate.PaymentInformation.id,
            basePrice: 1,
            shippingPrice: {
                domestic: 2,
                international: 3
            } as ShippingPriceCreateRequest,
            cryptocurrencyAddress: {
                type: CryptoAddressType.NORMAL,
                address: '1234'
            } as CryptocurrencyAddressCreateRequest
        } as ItemPriceCreateRequest;

        await itemPriceService.create(testData).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        });
    });

    test('Should throw ValidationException because there is no basePrice', async () => {
        expect.assertions(1);

        const testData = {
            payment_information_id: listingItemTemplate.PaymentInformation.id,
            currency: Cryptocurrency.BTC,
            shippingPrice: {
                domestic: 0.123,
                international: 1.234
            } as ShippingPriceCreateRequest,
            cryptocurrencyAddress: {
                type: CryptoAddressType.NORMAL,
                address: '1234'
            } as CryptocurrencyAddressCreateRequest
        } as ItemPriceCreateRequest;

        await itemPriceService.create(testData).catch(e => {
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        });
    });

    test('Should create a new ItemPrice', async () => {

        const testData = {
            payment_information_id: listingItemTemplate.PaymentInformation.id,
            currency: Cryptocurrency.BTC,
            basePrice: 1,
            shippingPrice: {
                domestic: 2,
                international: 3
            } as ShippingPriceCreateRequest,
            cryptocurrencyAddress: {
                type: CryptoAddressType.NORMAL,
                address: '1234'
            } as CryptocurrencyAddressCreateRequest
        } as ItemPriceCreateRequest;

        itemPrice = await itemPriceService.create(testData).then(value => value.toJSON());
        const result: resources.ItemPrice = itemPrice;

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testData.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testData.shippingPrice.international);
        expect(result.CryptocurrencyAddress.type).toBe(testData.cryptocurrencyAddress.type);
        expect(result.CryptocurrencyAddress.address).toBe(testData.cryptocurrencyAddress.address);
    });

    test('Should list ItemPrices with our new create one', async () => {
        const results: resources.ItemPrice[] = await itemPriceService.findAll().then(value => value.toJSON());
        const result = results[0];

        expect(results.length).toBe(1);
        expect(result.currency).toBe(itemPrice.currency);
        expect(result.basePrice).toBe(itemPrice.basePrice);
        expect(result.ShippingPrice).toBe(undefined); // doesnt fetch related
        expect(result.CryptocurrencyAddress).toBe(undefined); // doesnt fetch related
    });

    test('Should return one ItemPrice', async () => {
        const result: resources.ItemPrice = await itemPriceService.findOne(itemPrice.id)
            .then(value => value.toJSON());

        log.debug('result', JSON.stringify(result, null, 2));

        expect(result.currency).toBe(itemPrice.currency);
        expect(result.basePrice).toBe(itemPrice.basePrice);
        expect(result.ShippingPrice.domestic).toBe(itemPrice.ShippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(itemPrice.ShippingPrice.international);
        expect(result.CryptocurrencyAddress.type).toBe(itemPrice.CryptocurrencyAddress.type);
        expect(result.CryptocurrencyAddress.address).toBe(itemPrice.CryptocurrencyAddress.address);
    });

    test('Should update the ItemPrice', async () => {

        const testDataUpdated = {
            currency: Cryptocurrency.PART,
            basePrice: 2,
            shippingPrice: {
                domestic: 3,
                international: 4
            } as ShippingPriceUpdateRequest,
            cryptocurrencyAddress: {
                type: CryptoAddressType.STEALTH,
                address: '4567'
            } as CryptocurrencyAddressUpdateRequest
        } as ItemPriceUpdateRequest;

        const result: resources.ItemPrice = await itemPriceService.update(itemPrice.id, testDataUpdated)
            .then(value => value.toJSON());

        expect(result.currency).toBe(testDataUpdated.currency);
        expect(result.basePrice).toBe(testDataUpdated.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testDataUpdated.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testDataUpdated.shippingPrice.international);
        expect(result.CryptocurrencyAddress.type).toBe(testDataUpdated.cryptocurrencyAddress.type);
        expect(result.CryptocurrencyAddress.address).toBe(testDataUpdated.cryptocurrencyAddress.address);
    });

    test('Should create a new ItemPrice missing ShippingPrice', async () => {
        const testData = {
            payment_information_id: listingItemTemplate.PaymentInformation.id,
            currency: Cryptocurrency.BTC,
            basePrice: 1,
            cryptocurrencyAddress: {
                type: CryptoAddressType.NORMAL,
                address: '1234'
            } as CryptocurrencyAddressCreateRequest
        } as ItemPriceCreateRequest;

        const result: resources.ItemPrice = await itemPriceService.create(testData).then(value => value.toJSON());

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.CryptocurrencyAddress.type).toBe(testData.cryptocurrencyAddress.type);
        expect(result.CryptocurrencyAddress.address).toBe(testData.cryptocurrencyAddress.address);

        // todo: why is this {}?? FIX
        expect(result.ShippingPrice).toEqual({});
    });

    test('Should create a new ItemPrice missing CryptocurrencyAddress', async () => {
        const testData = {
            payment_information_id: listingItemTemplate.PaymentInformation.id,
            currency: Cryptocurrency.BTC,
            basePrice: 1,
            shippingPrice: {
                domestic: 2,
                international: 3
            } as ShippingPriceCreateRequest
        } as ItemPriceCreateRequest;

        const result: resources.ItemPrice = await itemPriceService.create(testData).then(value => value.toJSON());

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testData.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testData.shippingPrice.international);
        expect(result.CryptocurrencyAddress).not.toBeDefined();
    });

    test('Should create a new ItemPrice missing ShippingPrice and CryptocurrencyAddress', async () => {
        const testData = {
            payment_information_id: listingItemTemplate.PaymentInformation.id,
            currency: Cryptocurrency.BTC,
            basePrice: 1
        } as ItemPriceCreateRequest;

        const result: resources.ItemPrice = await itemPriceService.create(testData).then(value => value.toJSON());

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        // todo: why is this {}?? FIX
        // todo: ...propably because of the relations
        expect(result.ShippingPrice).toEqual({});
        expect(result.CryptocurrencyAddress).not.toBeDefined();
    });

    test('Should delete the ItemPrice', async () => {
        expect.assertions(1);
        await itemPriceService.destroy(itemPrice.id);
        await itemPriceService.findOne(itemPrice.id).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPrice.id))
        );
    });

});
