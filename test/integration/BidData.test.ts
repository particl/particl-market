// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { BidDataService } from '../../src/api/services/model/BidDataService';
import { BidService } from '../../src/api/services/model/BidService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { BidDataCreateRequest } from '../../src/api/requests/model/BidDataCreateRequest';
import { BidDataUpdateRequest } from '../../src/api/requests/model/BidDataUpdateRequest';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../src/api/requests/testdata/GenerateListingItemParams';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { GenerateBidParams } from '../../src/api/requests/testdata/GenerateBidParams';
import { GenerateProfileParams } from '../../src/api/requests/testdata/GenerateProfileParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

describe('BidDatas', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let bidDataService: BidDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let bidService: BidService;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let sellerProfile: resources.Profile;

    let createdListingItem: resources.ListingItem;
    let createdBid: resources.Bid;
    let createdBidData: resources.BidData;

    const testData = {
        key: 'color',
        value: 'black'
    } as BidDataCreateRequest;

    const testDataUpdated = {
        key: 'color',
        value: 'black'
    } as BidDataUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        bidDataService = app.IoC.getNamed<BidDataService>(Types.Service, Targets.Service.model.BidDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.model.BidService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefaultForProfile(defaultProfile.id).then(value => value.toJSON());

        // generate seller profile
        const sellerProfileParams = new GenerateProfileParams([true, false]).toParamsArray();
        const profiles = await testDataService.generate({
            model: CreatableModel.PROFILE,
            amount: 1,
            withRelated: true,
            generateParams: sellerProfileParams
        } as TestDataGenerateRequest);
        sellerProfile = profiles[0];

        const generateParams = new GenerateListingItemParams([
            true,                               // generateItemInformation
            true,                               // generateItemLocation
            true,                               // generateShippingDestinations
            false,                              // generateItemImages
            true,                               // generatePaymentInformation
            true,                               // generateEscrow
            true,                               // generateItemPrice
            true,                               // generateMessagingInformation
            false,                              // generateListingItemObjects
            false                               // generateObjectDatas
        ]).toParamsArray();

        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem = listingItems[0];

        // create bid
        const bidParams = new GenerateBidParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            createdListingItem.hash,    // listingItemhash
            MPAction.MPA_BID,           // type
            defaultProfile.address,     // bidder
            sellerProfile.address       // seller
        ]).toParamsArray();

        const bids = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidParams
        } as TestDataGenerateRequest);
        createdBid = bids[0];


    });

    test('Should throw ValidationException because there is no bid_id', async () => {
        expect.assertions(1);

        await bidDataService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new BidData', async () => {
        // set bid id
        testData.bid_id = createdBid.id;

        log.debug('testData:', JSON.stringify(testData, null, 2));
        createdBidData = await bidDataService.create(testData).then(value => value.toJSON());
        const result: resources.BidData = createdBidData;

        // test the values
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should throw ValidationException because we want to create an empty BidData', async () => {
        expect.assertions(1);
        await bidDataService.create({} as BidDataCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list BidDatas with our new create one', async () => {
        const bidDatas = await bidDataService.findAll().then(value => value.toJSON());

        log.debug('biddatas: ', JSON.stringify(bidDatas, null, 2));
        expect(bidDatas.length).toBe(3); // generate creates two
        createdBidData = bidDatas[2];
        const result: resources.BidData = createdBidData;

        // test the values
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should return one bid data', async () => {
        createdBidData = await bidDataService.findOne(createdBidData.id).then(value => value.toJSON());
        const result: resources.BidData = createdBidData;

        // test the values
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should throw ValidationException because we want to update with out bid_id', async () => {
        expect.assertions(1);
        await bidDataService.update(createdBidData.id, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the bid data', async () => {
        testDataUpdated.bid_id = createdBid.id;
        createdBidData = await bidDataService.update(createdBidData.id, testDataUpdated).then(value => value.toJSON());
        const result: resources.BidData = createdBidData;

        // test the values
        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the bid data', async () => {
        expect.assertions(3);
        // delete created bid data
        await bidDataService.destroy(createdBidData.id);
        await bidDataService.findOne(createdBidData.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdBidData.id))
        );
        // delete created bid
        await bidService.destroy(createdBid.id);
        await bidService.findOne(createdBid.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdBid.id))
        );
        // delete create listing item
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );
    });

});
