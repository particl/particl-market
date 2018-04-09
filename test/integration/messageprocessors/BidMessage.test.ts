import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';

import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { ValidationException } from '../../../src/api/exceptions/ValidationException';

import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/MarketService';
import { ListingItemService } from '../../../src/api/services/ListingItemService';
import { BidService } from '../../../src/api/services/BidService';
import { ProfileService } from '../../../src/api/services/ProfileService';

import { ListingItem } from '../../../src/api/models/ListingItem';
import { ListingItemCreateRequest } from '../../../src/api/requests/ListingItemCreateRequest';
import { TestDataCreateRequest } from '../../../src/api/requests/TestDataCreateRequest';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { BidMessage } from '../../../src/api/messages/BidMessage';

import * as bidSmsg1 from '../../testdata/message/smsgMessageWithBidMessage1.json';

import * as resources from 'resources';

import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../../src/api/requests/TestDataGenerateRequest';
import { BidActionService } from '../../../src/api/services/BidActionService';
import { MarketplaceMessage } from '../../../src/api/messages/MarketplaceMessage';


describe('BidMessage', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    const testListingData = {
        hash: 'f08f3d6e',
        market_id: -1
    } as ListingItemCreateRequest;

    let testDataService: TestDataService;
    let listingItemService: ListingItemService;
    let marketService: MarketService;
    let bidService: BidService;
    let profileService: ProfileService;
    let bidActionService: BidActionService;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let createdListingItem: resources.ListingItem;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.BidService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        bidActionService = app.IoC.getNamed<BidActionService>(Types.Service, Targets.Service.BidActionService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // get default market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        const generateParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create listingitem
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem = listingItems[0];



    });

    afterAll(async () => {
        //
    });

    test('Should process MarketplaceEvent containing send bid BidMessage', async () => {

        const marketplaceMessage: MarketplaceMessage = JSON.parse(bidSmsg1.text);
        bidSmsg1.from = defaultProfile.address;
        marketplaceMessage.mpaction.item = createdListingItem.hash;
        log.debug('marketplaceMessage: ', JSON.stringify(marketplaceMessage, null, 2));
        // marketplaceMessage.market = listingItemSmsg1.to;

        const result = await bidActionService.processBidReceivedEvent({
            smsgMessage: bidSmsg1,
            marketplaceMessage
        });

        log.debug('result: ', JSON.stringify(result, null, 2));
        // log.debug('listingItemMessage: ', JSON.stringify(marketplaceMessage.item, null, 2));
        // log.debug('result.hash: ', JSON.stringify(result.hash, null, 2));
        // log.debug('listingItemMessage.hash: ', JSON.stringify(marketplaceMessage.item.hash, null, 2));

        // TODO: add more expects
        expect(result.action).toBe(marketplaceMessage.mpaction.action);
        //
        // expectListingItemFromMessage(result, marketplaceMessage.item);

    });
/*
    test('Should process MarketplaceEvent containing accept bid BidMessage', async () => {

        const marketplaceMessage: MarketplaceMessage = JSON.parse(bidSmsg1.text);
        bidSmsg1.from = defaultProfile.address;
        marketplaceMessage.mpaction.item = createdListingItem.hash;
        log.debug('marketplaceMessage: ', JSON.stringify(marketplaceMessage, null, 2));
        // marketplaceMessage.market = listingItemSmsg1.to;

        const result = await bidActionService.processBidReceivedEvent({
            smsgMessage: bidSmsg1,
            marketplaceMessage
        });

        log.debug('result: ', JSON.stringify(result, null, 2));
        // log.debug('listingItemMessage: ', JSON.stringify(marketplaceMessage.item, null, 2));
        // log.debug('result.hash: ', JSON.stringify(result.hash, null, 2));
        // log.debug('listingItemMessage.hash: ', JSON.stringify(marketplaceMessage.item.hash, null, 2));

        // TODO: add more expects
        expect(result.action).toBe(marketplaceMessage.mpaction.action);
        //
        // expectListingItemFromMessage(result, marketplaceMessage.item);

    });
*/

    /*
    test('Should throw ValidationException because no action', async () => {
        expect.assertions(1);

        const testBidData = {
            listing: 'placeholderValueReplacedInBeforeAll()',
            objects: [{
                id: 'colour',
                value: 'black'
            }]
        } as BidMessage;

        const action: BidMessageType = testBidData.action;
        await bidMessageProcessor.process(testBidData).catch(e => {
            testBidData.action = action;
            expect(e).toEqual(new ValidationException('Message body is not valid', []));
        });
        testBidData.action = action;
    });

    test('Should throw ValidationException because no listing hash', async () => {
        expect.assertions(1);

        const testBidData = {
            action: BidMessageType.MPA_BID,
            listing: 'placeholderValueReplacedInBeforeAll()',
            objects: [{
                id: 'colour',
                value: 'black'
            }]
        } as BidMessage;

        const listing: string = testBidData.listing;
        delete testBidData.listing;
        await bidMessageProcessor.process(testBidData).catch(e => {
            testBidData.listing = listing;
            expect(e).toEqual(new ValidationException('Message body is not valid', []));
        });
        testBidData.listing = listing;
    });

    test('Should throw NotFoundException because invalid listing hash', async () => {
        expect.assertions(1);

        const testBidData = {
            action: BidMessageType.MPA_BID,
            listing: 'placeholderValueReplacedInBeforeAll()',
            objects: [{
                id: 'colour',
                value: 'black'
            }]
        } as BidMessage;

        const listing = testBidData.listing;
        const invalidListing = 'SomeInvalidHash';
        testBidData.listing = invalidListing;
        await bidMessageProcessor.process(testBidData).catch(e => {
            // log.error('A100: ' + e);
            testBidData.listing = listing;
            expect(e).toEqual(new NotFoundException(invalidListing));
        });
        testBidData.listing = listing;
    });

    test('Should throw NotFoundException because invalid bid action', async () => {
        expect.assertions(1);
        const action = testBidData.action;
        const invalidAction = 'SomeInvalidAction';
        testBidData.action = invalidAction;
        await bidMessageProcessor.process(testBidData).catch(e => {
            log.error('B100: ' + e);
            invalidAction.action = action;
            expect(e).toEqual(new SomeKindOfException(testBidData.listing));
        });
        testBidData.action = action;
    }); */
/*
    test('Should create a new bid by bidMessage', async () => {

        const testBidData = {
            action: BidMessageType.MPA_BID,
            listing: createdListingItem.Hash,
            objects: [{
                id: 'colour',
                value: 'black'
            }]
        } as BidMessage;

        log.debug('testBidData: ', testBidData);
        // create bid
        const bidModel = await bidMessageProcessor.process(testBidData);
        const result = bidModel.toJSON();
        createdBidId = bidModel.Id;

        // test the values
        expect(result.action).toBe(testBidData.action);
        expect(result.listingItemId).toBe(createdListingItem.Id);
        expect(result.BidDatas.length).toBe(1);
        expect(result.BidDatas[0].dataId).toBe(testBidData.objects[0].id);
        expect(result.BidDatas[0].dataValue).toBe(testBidData.objects[0].value);
    });
*/
});

