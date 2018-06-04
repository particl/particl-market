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
import {TestDataGenerateRequest} from '../../src/api/requests/TestDataGenerateRequest';
import {IsNotEmpty} from 'class-validator';
import {CreatableModel} from '../../src/api/enums/CreatableModel';
import {GenerateProfileParams} from '../../src/api/requests/params/GenerateProfileParams';
import {GenerateBidParams} from '../../src/api/requests/params/GenerateBidParams';
import * as resources from 'resources';
import {BidMessageType} from '../../src/api/enums/BidMessageType';
import {ProfileService} from '../../src/api/services/ProfileService';

describe('LockedOutput', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let lockedOutputService: LockedOutputService;
    let profileService: ProfileService;

    let createdId;
    let bid: resources.Bid;
    let defaultProfile: resources.Profile;

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

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        /*
         * [0]: generateListingItemTemplate, generate a ListingItemTemplate
         * [1]: generateListingItem, generate a ListingItem
         * [2]: listingItemhash, attach bid to existing ListingItem
         * [3]: action, bid action, see BidMessageType
         * [4]: bidder, bidders address
         * [5]: listingItemSeller, ListingItem sellers address
         */

        const bidParams = new GenerateBidParams([
            true,
            true,
            null,
            BidMessageType.MPA_BID,
            defaultProfile.address,
            'listingItemSeller.address'
        ]).toParamsArray();

        const bids = await testDataService.generate({
            model: CreatableModel.BID,
            amount: 1,
            withRelated: true,
            generateParams: bidParams
        } as TestDataGenerateRequest);
        bid = bids[0];

        log.debug('bid:', JSON.stringify(bid, null, 2));
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
        createdId = lockedOutputModel.Id;

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
        const lockedOutputModel: LockedOutput = await lockedOutputService.findOne(createdId);
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
        // testDataUpdated['related_id'] = 0;
        const lockedOutputModel: LockedOutput = await lockedOutputService.update(createdId, testDataUpdated);
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
        await lockedOutputService.destroy(createdId);
        await lockedOutputService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
