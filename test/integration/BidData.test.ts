// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
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
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import {NotFoundException} from '../../src/api/exceptions/NotFoundException';

describe('BidData', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let bidDataService: BidDataService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let bidService: BidService;

    let bidderMarket: resources.Market;
    let bidderProfile: resources.Profile;
    let sellerProfile: resources.Profile;
    let sellerMarket: resources.Market;

    let listingItem: resources.ListingItem;
    let bid: resources.Bid;
    let bidData: resources.BidData;

    const testData = {
        key: 'color',
        value: 'black'
    } as BidDataCreateRequest;

    const testDataUpdated = {
        key: 'color',
        value: 'white'
    } as BidDataUpdateRequest;


    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        bidDataService = app.IoC.getNamed<BidDataService>(Types.Service, Targets.Service.model.BidDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.model.BidService);

        bidderProfile = await profileService.getDefault().then(value => value.toJSON());
        bidderMarket = await marketService.getDefaultForProfile(bidderProfile.id).then(value => value.toJSON());

        sellerProfile = await testDataService.generateProfile();
        log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));

        sellerMarket = await marketService.getDefaultForProfile(sellerProfile.id).then(value => value.toJSON());
        log.debug('sellerMarket: ', JSON.stringify(sellerMarket, null, 2));

        listingItem = await testDataService.generateListingItemWithTemplate(sellerProfile, bidderMarket);
        log.debug('listingItem: ', JSON.stringify(listingItem, null, 2));

        const bidParams = new GenerateBidParams([
            false,                              // generateListingItemTemplate
            false,                              // generateListingItem
            listingItem.id,                     // listingItemId
            MPAction.MPA_BID,                   // type
            bidderMarket.Identity.address,      // bidder
            sellerMarket.Identity.address,      // seller
            undefined                           // parentBidId, should be set if type !== MPA_BID
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
        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should throw ValidationException because we want to create an empty BidData', async () => {
        expect.assertions(1);
        await bidDataService.create({} as BidDataCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list BidDatas with our new create one', async () => {
        const bidDatas = await bidDataService.findAll().then(value => value.toJSON());

        expect(bidDatas.length).toBe(5); // 2 bids * 2 bid datas + 1
        bidData = bidDatas[4];
        const result: resources.BidData = bidData;

        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should return one bid data', async () => {
        bidData = await bidDataService.findOne(bidData.id).then(value => value.toJSON());
        const result: resources.BidData = bidData;

        expect(result.key).toBe(testData.key);
        expect(result.value).toBe(testData.value);
    });

    test('Should update the bid data', async () => {
        bidData = await bidDataService.update(bidData.id, testDataUpdated).then(value => value.toJSON());
        const result: resources.BidData = bidData;

        expect(result.key).toBe(testDataUpdated.key);
        expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the bid data', async () => {
        expect.assertions(2);
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
