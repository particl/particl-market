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
import { AddressService } from '../../../src/api/services/AddressService';

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
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { GenerateProfileParams } from '../../../src/api/requests/params/GenerateProfileParams';
import { ListingItemTemplateService } from '../../../src/api/services/ListingItemTemplateService';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import { MarketplaceEvent } from '../../../src/api/messages/MarketplaceEvent';
import { BidFactory } from '../../../src/api/factories/BidFactory';
import { SmsgMessage } from '../../../src/api/messages/SmsgMessage';

import * as addressCreateRequestSHIPPING_OWN from '../../testdata/createrequest/addressCreateRequestSHIPPING_OWN.json';
import {AddressType} from '../../../src/api/enums/AddressType';


describe('BidMessageProcessing', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    const testListingData = {
        hash: 'f08f3d6e',
        market_id: -1
    } as ListingItemCreateRequest;

    let testDataService: TestDataService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;
    let marketService: MarketService;
    let bidService: BidService;
    let profileService: ProfileService;
    let addressService: AddressService;
    let bidActionService: BidActionService;
    let bidFactory: BidFactory;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let sellerProfile: resources.Profile;

    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;
    let bid: resources.Bid;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.BidService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.AddressService);
        bidActionService = app.IoC.getNamed<BidActionService>(Types.Service, Targets.Service.BidActionService);
        bidFactory = app.IoC.getNamed<BidFactory>(Types.Factory, Targets.Factory.BidFactory);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        let defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // create shipping address for default profile
        const addressCreateRequest = addressCreateRequestSHIPPING_OWN;
        addressCreateRequest.profile_id = defaultProfile.id;
        await addressService.create(addressCreateRequest);

        // fetch it again
        defaultProfileModel = await profileService.getDefault();
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
        const templateGenerateParams = new GenerateListingItemTemplateParams();
        templateGenerateParams.profileId = sellerProfile.id;
        templateGenerateParams.generateListingItem = true;
        templateGenerateParams.marketId = defaultMarket.id;

        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams: templateGenerateParams.toParamsArray()
        } as TestDataGenerateRequest);
        listingItemTemplate = listingItemTemplates[0];

        const createdListingItemModel = await listingItemService.findOne(listingItemTemplate.ListingItems[0].id);
        listingItem = createdListingItemModel.toJSON();

        // expect template is related to correct profile and listingitem posted to correct market
        expect(listingItemTemplate.Profile.id).toBe(sellerProfile.id);
        expect(listingItemTemplate.ListingItems[0].marketId).toBe(defaultMarket.id);

        // expect template hash created on the server matches what we create here
        const generatedTemplateHash = ObjectHash.getHash(listingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);
        log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        log.debug('generatedTemplateHash:', generatedTemplateHash);
        expect(listingItemTemplate.hash).toBe(generatedTemplateHash);

        // expect the item hash generated at the same time as template, matches with the templates one
        log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        log.debug('listingItemTemplate.ListingItems[0].hash:', listingItemTemplate.ListingItems[0].hash);
        expect(listingItemTemplate.hash).toBe(listingItemTemplate.ListingItems[0].hash);

        delete listingItem.ItemInformation.ItemImages;
        log.debug('listingItem:', JSON.stringify(listingItem, null, 2));

        // expect the ListingItem have no Bids and one ActionMessage at this point
        expect(listingItem.Bids).toHaveLength(0);
        expect(listingItem.ActionMessages).toHaveLength(1);

        // we now have:
        // - defaultProfile: Profile, for buyer
        // - sellerProfile: Profile, for seller
        // - listingItemTemplate, linked to seller profile
        // - listingItem, linked to template
        // - listingItem and template containing the same data with same hash
        // - listingItem having one actionMessage: MP_ITEM_ADD
        // - listingItem having no Bids

    });

    afterAll(async () => {
        //
    });

    test('Should process MarketplaceEvent containing MPA_BID BidMessage', async () => {

        // create bid.objects for MPA_BID
        const bidDatas = await bidActionService.generateBidDatasForMPA_BID(
            listingItem,
            defaultProfile.ShippingAddresses[0],
            ['size', 'XL', 'color', 'pink']
        );

        // create MPA_BID type of MarketplaceMessage
        const bidMessage: BidMessage = await bidFactory.getMessage(BidMessageType.MPA_BID, listingItem.hash, bidDatas);

        const marketplaceMessage: MarketplaceMessage = {
            version: '0300',    // todo: means paid, change to free, add enum?
            mpaction: bidMessage,
            market: defaultMarket.address
        };

        expect(marketplaceMessage.mpaction.item).toBe(listingItem.hash);

        const smsgMessage: SmsgMessage = {
            msgid: 'TESTMESSAGE' + new Date().getTime(),
            version: '0300',
            received: new Date().toISOString(),
            sent: new Date().toISOString(),
            from: defaultProfile.address,
            to: sellerProfile.address,
            text: JSON.stringify(marketplaceMessage)
        };

        // process the message like it was received as MarketplaceEvent
        const result = await bidActionService.processBidReceivedEvent({
            smsgMessage,
            marketplaceMessage
        } as MarketplaceEvent);

        log.debug('result: ', JSON.stringify(result, null, 2));
        // log.debug('listingItemMessage: ', JSON.stringify(marketplaceMessage.item, null, 2));
        // log.debug('result.hash: ', JSON.stringify(result.hash, null, 2));
        // log.debug('listingItemMessage.hash: ', JSON.stringify(marketplaceMessage.item.hash, null, 2));

        expect(result.action).toBe(bidMessage.action);
        expect(result.bidder).toBe(smsgMessage.from);
        expect(result.ListingItem.hash).toBe(listingItem.hash);
        expect(result.ListingItem.ListingItemTemplate.hash).toBe(listingItem.hash);
        expect(result.ListingItem.seller).toBe(listingItem.seller);
        expect(result.ListingItem.seller).toBe(sellerProfile.address);
        expect(result.ListingItem.marketId).toBe(defaultMarket.id);
        expect(result.ShippingAddress.firstName).toBe(defaultProfile.ShippingAddresses[0].firstName);
        expect(result.ShippingAddress.lastName).toBe(defaultProfile.ShippingAddresses[0].lastName);
        expect(result.ShippingAddress.country).toBe(defaultProfile.ShippingAddresses[0].country);
        expect(result.ShippingAddress.zipCode).toBe(defaultProfile.ShippingAddresses[0].zipCode);
        expect(result.ShippingAddress.type).toBe(AddressType.SHIPPING_BID);
        expect(result.BidDatas).toHaveLength(14);

        const createdListingItemModel = await listingItemService.findOneByHash(result.ListingItem.hash);
        listingItem = createdListingItemModel.toJSON();

        expect(listingItem.Bids).toHaveLength(1);
        expect(listingItem.ActionMessages).toHaveLength(2);

        bid = result;
    });

    test('Should process MarketplaceEvent containing MPA_ACCEPT BidMessage', async () => {

        // create bid.objects for MPA_ACCEPT
        const bidDatas = await bidActionService.generateBidDatasForMPA_ACCEPT(listingItem, bid);

        // create MPA_ACCEPT type of MarketplaceMessage
        const bidMessage: BidMessage = await bidFactory.getMessage(BidMessageType.MPA_ACCEPT, listingItem.hash, bidDatas);

        const marketplaceMessage: MarketplaceMessage = {
            version: '0300',    // todo: means paid, change to free, add enum?
            mpaction: bidMessage,
            market: defaultMarket.address
        };

        log.debug('marketplaceMessage: ', JSON.stringify(marketplaceMessage, null, 2));

        expect(marketplaceMessage.mpaction.item).toBe(listingItem.hash);

        const smsgMessage: SmsgMessage = {
            msgid: 'TESTMESSAGE' + new Date().getTime(),
            version: '0300',
            received: new Date().toISOString(),
            sent: new Date().toISOString(),
            from: sellerProfile.address,
            to: defaultProfile.address,
            text: JSON.stringify(marketplaceMessage)
        };

        // process the message like it was received as MarketplaceEvent
        const result = await bidActionService.processBidReceivedEvent({
            smsgMessage,
            marketplaceMessage
        } as MarketplaceEvent);

        log.debug('result: ', JSON.stringify(result, null, 2));

        expect(result.action).toBe(bidMessage.action);
        expect(result.bidder).toBe(smsgMessage.from);
        expect(result.ListingItem.hash).toBe(listingItem.hash);
        expect(result.ListingItem.ListingItemTemplate.hash).toBe(listingItem.hash);
        expect(result.ListingItem.seller).toBe(listingItem.seller);
        expect(result.ListingItem.seller).toBe(sellerProfile.address);
        expect(result.ListingItem.marketId).toBe(defaultMarket.id);
        expect(result.ShippingAddress.firstName).toBe(defaultProfile.ShippingAddresses[0].firstName);
        expect(result.ShippingAddress.lastName).toBe(defaultProfile.ShippingAddresses[0].lastName);
        expect(result.ShippingAddress.country).toBe(defaultProfile.ShippingAddresses[0].country);
        expect(result.ShippingAddress.zipCode).toBe(defaultProfile.ShippingAddresses[0].zipCode);
        expect(result.ShippingAddress.type).toBe(AddressType.SHIPPING_BID);
        expect(result.BidDatas).toHaveLength(14);

        const createdListingItemModel = await listingItemService.findOneByHash(result.ListingItem.hash);
        listingItem = createdListingItemModel.toJSON();

        expect(listingItem.Bids).toHaveLength(1);
        expect(listingItem.ActionMessages).toHaveLength(3);

        bid = result;

    });


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

