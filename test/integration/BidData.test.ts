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
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { GenerateBidParams } from '../../src/api/requests/testdata/GenerateBidParams';
import { GenerateProfileParams } from '../../src/api/requests/testdata/GenerateProfileParams';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';

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

    let market: resources.Market;
    let profile: resources.Profile;
    let sellerProfile: resources.Profile;

    let listingItem: resources.ListingItem;
    let bid: resources.Bid;
    let bidData: resources.BidData;

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

        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        const sellerProfileParams = new GenerateProfileParams([true, false]).toParamsArray();
        const profiles = await testDataService.generate({
            model: CreatableModel.PROFILE,
            amount: 1,
            withRelated: true,
            generateParams: sellerProfileParams
        } as TestDataGenerateRequest);
        sellerProfile = profiles[0];

        const generateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            false,      // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            false,      // generateMessagingInformation
            false,      // generateListingItemObjects
            false,      // generateObjectDatas
            profile.id, // profileId
            true,       // generateListingItem
            market.id   // marketId
        ]).toParamsArray();
        const listingItemTemplates: resources.ListingItemTemplate[] = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams
        } as TestDataGenerateRequest);
        listingItem = listingItemTemplates[0].ListingItems[0];

        // create bid
        const bidParams = new GenerateBidParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            listingItem.hash,           // listingItemhash
            MPAction.MPA_BID,           // type
            profile.address,            // bidder
            sellerProfile.address       // seller
        ]).toParamsArray();

        const bids = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidParams
        } as TestDataGenerateRequest);
        bid = bids[0];

    });

    test('Should throw ValidationException because there is no bid_id', async () => {
        expect.assertions(1);

        await bidDataService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new BidData', async () => {
        testData.bid_id = bid.id;

        bidData = await bidDataService.create(testData).then(value => value.toJSON());
        const result: resources.BidData = bidData;

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

        expect(bidDatas.length).toBe(3); // generate creates two
        bidData = bidDatas[2];
        const result: resources.BidData = bidData;

        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should return one bid data', async () => {
        bidData = await bidDataService.findOne(bidData.id).then(value => value.toJSON());
        const result: resources.BidData = bidData;

        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should update the bid data', async () => {
        bidData = await bidDataService.update(bidData.id, testDataUpdated).then(value => value.toJSON());
        const result: resources.BidData = bidData;

        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the bid data', async () => {
        expect.assertions(3);
        // delete created bid data
        await bidDataService.destroy(bidData.id);
        await bidDataService.findOne(bidData.id).catch(e =>
            expect(e).toEqual(new NotFoundException(bidData.id))
        );
        // delete created bid
        await bidService.destroy(bid.id);
        await bidService.findOne(bid.id).catch(e =>
            expect(e).toEqual(new NotFoundException(bid.id))
        );
        // delete create listing item
        await listingItemService.destroy(listingItem.id);
        await listingItemService.findOne(listingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItem.id))
        );
    });

});
