// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestDataService } from '../../src/api/services/TestDataService';
import { TestUtil } from './lib/TestUtil';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { OrderItem } from '../../src/api/models/OrderItem';
import { OrderItemService } from '../../src/api/services/OrderItemService';
import {OrderItemCreateRequest} from '../../src/api/requests/OrderItemCreateRequest';
import {OrderItemUpdateRequest} from '../../src/api/requests/OrderItemUpdateRequest';
import {OrderStatus} from '../../src/api/enums/OrderStatus';
import {IsEnum, IsNotEmpty} from 'class-validator';
import {OrderItemObjectCreateRequest} from '../../src/api/requests/OrderItemObjectCreateRequest';
import {GenerateListingItemTemplateParams} from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import {CreatableModel} from '../../src/api/enums/CreatableModel';
import {TestDataGenerateRequest} from '../../src/api/requests/TestDataGenerateRequest';
import {GenerateProfileParams} from '../../src/api/requests/params/GenerateProfileParams';
import {ProfileService} from '../../src/api/services/ProfileService';
import {MarketService} from '../../src/api/services/MarketService';
import * as resources from 'resources';

describe('OrderItem', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let orderItemService: OrderItemService;
    let marketService: MarketService;
    let profileService: ProfileService;

    const testData = {
        itemHash: '',
        bid_id: 1,
        status: OrderStatus.AWAITING_ESCROW,
        orderItemObjects: OrderItemObjectCreateRequest[],
        order_id: 1
    } as OrderItemCreateRequest;

    const testDataUpdated = {
        itemHash: '',
        bid_id: 1,
        status: OrderStatus.AWAITING_ESCROW,
        orderItemObjects: OrderItemObjectCreateRequest[],
        order_id: 1
    } as OrderItemUpdateRequest;

    let buyerProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let defaultMarket: resources.Market;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.OrderItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();
        log.debug('defaultMarket: ', defaultMarket);

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        buyerProfile = defaultProfileModel.toJSON();
        log.debug('buyerProfile: ', buyerProfile);

        // generate a seller profile in addition to the default one used for buyer
        const generateProfileParams = new GenerateProfileParams().toParamsArray();
        const profiles = await testDataService.generate({
            model: CreatableModel.PROFILE,              // what to generate
            amount: 1,                                  // how many to generate
            withRelated: true,                          // return model
            generateParams: generateProfileParams       // what kind of data to generate
        } as TestDataGenerateRequest);
        sellerProfile = profiles[0];
        log.debug('sellerProfile: ', sellerProfile.id);

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            sellerProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();



    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderItemService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new order item', async () => {
        // testData['related_id'] = 0;
        const orderItemModel: OrderItem = await orderItemService.create(testData);
        createdId = orderItemModel.Id;

        const result = orderItemModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.status).toBe(testData.status);
    });

    test('Should throw ValidationException because we want to create a empty order item', async () => {
        expect.assertions(1);
        await orderItemService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list order items with our new create one', async () => {
        const orderItemCollection = await orderItemService.findAll();
        const orderItem = orderItemCollection.toJSON();
        expect(orderItem.length).toBe(1);

        const result = orderItem[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.status).toBe(testData.status);
    });

    test('Should return one order item', async () => {
        const orderItemModel: OrderItem = await orderItemService.findOne(createdId);
        const result = orderItemModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.status).toBe(testData.status);
    });

    /*
    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await orderItemService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });
    */

    test('Should update the order item', async () => {
        // testDataUpdated['related_id'] = 0;
        const orderItemModel: OrderItem = await orderItemService.update(createdId, testDataUpdated);
        const result = orderItemModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.status).toBe(testDataUpdated.status);
    });

    test('Should delete the order item', async () => {
        expect.assertions(1);
        await orderItemService.destroy(createdId);
        await orderItemService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
