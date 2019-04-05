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
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { LockedOutput } from '../../src/api/models/LockedOutput';
import { LockedOutputService } from '../../src/api/services/LockedOutputService';
import { LockedOutputCreateRequest } from '../../src/api/requests/LockedOutputCreateRequest';
import { LockedOutputUpdateRequest } from '../../src/api/requests/LockedOutputUpdateRequest';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateBidParams } from '../../src/api/requests/params/GenerateBidParams';
import { ProfileService } from '../../src/api/services/ProfileService';
import { GenerateProfileParams } from '../../src/api/requests/params/GenerateProfileParams';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';

describe('LockedOutput', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let lockedOutputService: LockedOutputService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let sellerProfile: resources.Profile;

    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;
    let bid: resources.Bid;

    let createdLockedOutput: resources.LockedOutput;

    const testData = {
        txid: '5b3b8a1a99edc7b1a539efb870cefec4d7a984c503fdac8eb05504c71629dxxx',
        vout: 1,
        amount: 1.1,
        data: 'asdf',
        address: 'pb5Rkdt1di1ijxkM1n96ywWApqqihdHxxx',
        scriptPubKey: '76a91443f17d41fdbf8fed3335b278945e7269701ac9518xxx'
    } as LockedOutputCreateRequest;

    const testDataUpdated = {
        txid: '5b3b8a1a99edc7b1a539efb870cefec4d7a984c503fdac8eb05504c71629dyyy',
        vout: 2,
        amount: 2.1,
        data: 'qwer',
        address: 'pb5Rkdt1di1ijxkM1n96ywWApqqihdHyyy',
        scriptPubKey: '76a91443f17d41fdbf8fed3335b278945e7269701ac9518yyy'
    } as LockedOutputUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        lockedOutputService = app.IoC.getNamed<LockedOutputService>(Types.Service, Targets.Service.LockedOutputService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // get default market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        // generate seller profile
        const sellerProfileParams = new GenerateProfileParams([true, false]).toParamsArray();
        const profiles = await testDataService.generate({
            model: CreatableModel.PROFILE,
            amount: 1,
            withRelated: true,
            generateParams: sellerProfileParams
        } as TestDataGenerateRequest);
        sellerProfile = profiles[0];

        // generate ListingItemTemplate with ListingItem to sell
        const templateGenerateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
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

        // log.debug('templateGenerateParams:', JSON.stringify(templateGenerateParams, null, 2));

        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams: templateGenerateParams
        } as TestDataGenerateRequest);
        listingItemTemplate = listingItemTemplates[0];

        // log.debug('listingItemTemplate:', JSON.stringify(listingItemTemplate, null, 2));

        const createdListingItemModel = await listingItemService.findOne(listingItemTemplate.ListingItems[0].id);
        listingItem = createdListingItemModel.toJSON();

        const bidParams = new GenerateBidParams([
            false,                      // generateListingItemTemplate
            false,                      // generateListingItem
            listingItem.hash,           // listingItemhash
            MPAction.MPA_BID,     // type
            defaultProfile.address,     // bidder
            sellerProfile.address       // seller
        ]).toParamsArray();

        const bids = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidParams
        } as TestDataGenerateRequest);
        bid = bids[0];

        // log.debug('bid:', JSON.stringify(bid, null, 2));
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no related_id', async () => {
        expect.assertions(1);
        await lockedOutputService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new locked output', async () => {

        testData.bid_id = bid.id;
        const lockedOutputModel: LockedOutput = await lockedOutputService.create(testData);
        createdLockedOutput = lockedOutputModel.toJSON();

        // test the values
        expect(createdLockedOutput.txid).toBe(testData.txid);
        expect(createdLockedOutput.vout).toBe(testData.vout);
        expect(createdLockedOutput.amount).toBe(testData.amount);
        expect(createdLockedOutput.data).toBe(testData.data);
        expect(createdLockedOutput.address).toBe(testData.address);
        expect(createdLockedOutput.scriptPubKey).toBe(testData.scriptPubKey);
    });

    test('Should throw ValidationException because we want to create a empty locked output', async () => {
        expect.assertions(1);
        await lockedOutputService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list locked outputs with our new create one', async () => {
        const lockedOutputCollection = await lockedOutputService.findAll();
        const lockedOutput = lockedOutputCollection.toJSON();
        expect(lockedOutput.length).toBe(1);

        const result = lockedOutput[0];

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.txid).toBe(testData.txid);
        expect(result.vout).toBe(testData.vout);
        expect(result.amount).toBe(testData.amount);
        expect(result.data).toBe(testData.data);
        expect(result.address).toBe(testData.address);
        expect(result.scriptPubKey).toBe(testData.scriptPubKey);
    });

    test('Should return one locked output', async () => {
        const lockedOutputModel: LockedOutput = await lockedOutputService.findOne(createdLockedOutput.id);
        const result = lockedOutputModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
        expect(result.txid).toBe(testData.txid);
        expect(result.vout).toBe(testData.vout);
        expect(result.amount).toBe(testData.amount);
        expect(result.data).toBe(testData.data);
        expect(result.address).toBe(testData.address);
        expect(result.scriptPubKey).toBe(testData.scriptPubKey);
    });

    test('Should update the locked output', async () => {
        const lockedOutputModel: LockedOutput = await lockedOutputService.update(createdLockedOutput.id, testDataUpdated);
        const result = lockedOutputModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
        expect(result.txid).toBe(testDataUpdated.txid);
        expect(result.vout).toBe(testDataUpdated.vout);
        expect(result.amount).toBe(testDataUpdated.amount);
        expect(result.data).toBe(testDataUpdated.data);
        expect(result.address).toBe(testDataUpdated.address);
        expect(result.scriptPubKey).toBe(testDataUpdated.scriptPubKey);
    });

    test('Should delete the locked output', async () => {
        expect.assertions(1);
        await lockedOutputService.destroy(createdLockedOutput.id);
        await lockedOutputService.findOne(createdLockedOutput.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdLockedOutput.id))
        );
    });

});
