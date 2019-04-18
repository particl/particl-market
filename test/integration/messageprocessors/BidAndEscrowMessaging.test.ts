// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as addressCreateRequestSHIPPING_OWN from '../../testdata/createrequest/addressCreateRequestSHIPPING_OWN.json';
import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { MarketService } from '../../../src/api/services/model/MarketService';
import { ListingItemService } from '../../../src/api/services/model/ListingItemService';
import { BidService } from '../../../src/api/services/model/BidService';
import { ProfileService } from '../../../src/api/services/model/ProfileService';
import { AddressService } from '../../../src/api/services/model/AddressService';
import { BidMessage } from '../../../src/api/messages/action/BidMessage';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../../src/api/requests/testdata/TestDataGenerateRequest';
import { BidActionService } from '../../../src/api/services/action/BidActionService';
import { MarketplaceMessage } from '../../../src/api/messages/MarketplaceMessage';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { GenerateProfileParams } from '../../../src/api/requests/testdata/GenerateProfileParams';
import { ListingItemTemplateService } from '../../../src/api/services/model/ListingItemTemplateService';
import { ObjectHashDeprecated } from '../../../src/api/messages/hashable/ObjectHashDeprecated';
import { HashableObjectTypeDeprecated } from '../../../src/api/enums/HashableObjectTypeDeprecated';
import { MarketplaceMessageEvent } from '../../../src/api/messages/MarketplaceMessageEvent';
import { AddressType } from '../../../src/api/enums/AddressType';
import { EscrowActionServiceDEPRECATED } from '../../../src/api/services/action/EscrowActionServiceDEPRECATED';
import { OrderItemService } from '../../../src/api/services/model/OrderItemService';
import { OrderService } from '../../../src/api/services/model/OrderService';
import { CoreSmsgMessage } from '../../../src/api/messages/CoreSmsgMessage';
import { SmsgMessageStatus } from '../../../src/api/enums/SmsgMessageStatus';
import { BidDataValue } from '../../../src/api/enums/BidDataValue';
import { BidMessageFactory } from '../../../src/api/factories/message/BidMessageFactory';
import { MPAction } from 'omp-lib/dist/interfaces/omp-enums';
import { EscrowRefundMessageFactory } from '../../../src/api/factories/message/EscrowRefundMessageFactory';
import { EscrowLockMessageFactory } from '../../../src/api/factories/message/EscrowLockMessageFactory';
import { EscrowReleaseMessageFactory } from '../../../src/api/factories/message/EscrowReleaseMessageFactory';


describe('BidAndEscrowMessageProcessing', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemService: ListingItemService;
    let listingItemTemplateService: ListingItemTemplateService;
    let marketService: MarketService;
    let bidService: BidService;
    let profileService: ProfileService;
    let addressService: AddressService;
    let bidActionService: BidActionService;
    let escrowActionService: EscrowActionServiceDEPRECATED;
    let orderItemService: OrderItemService;
    let orderService: OrderService;

    let bidMessageFactory: BidMessageFactory;
    let escrowLockMessageFactory: EscrowLockMessageFactory;
    let escrowRefundMessageFactory: EscrowRefundMessageFactory;
    let escrowReleaseMessageFactory: EscrowReleaseMessageFactory;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let sellerProfile: resources.Profile;

    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;
    let bid: resources.Bid;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        log.debug('jasmine.DEFAULT_TIMEOUT_INTERVAL', jasmine.DEFAULT_TIMEOUT_INTERVAL);

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        bidService = app.IoC.getNamed<BidService>(Types.Service, Targets.Service.model.BidService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.model.AddressService);
        bidActionService = app.IoC.getNamed<BidActionService>(Types.Service, Targets.Service.BidActionService);
        escrowActionService = app.IoC.getNamed<EscrowActionServiceDEPRECATED>(Types.Service, Targets.Service.EscrowActionService);
        orderItemService = app.IoC.getNamed<OrderItemService>(Types.Service, Targets.Service.model.OrderItemService);
        orderService = app.IoC.getNamed<OrderService>(Types.Service, Targets.Service.model.OrderService);
        bidMessageFactory = app.IoC.getNamed<BidMessageFactory>(Types.Factory, Targets.Factory.message.BidMessageFactory);
        escrowLockMessageFactory = app.IoC.getNamed<EscrowLockMessageFactory>(Types.Factory, Targets.Factory.message.EscrowLockMessageFactory);
        escrowRefundMessageFactory = app.IoC.getNamed<EscrowRefundMessageFactory>(Types.Factory, Targets.Factory.message.EscrowRefundMessageFactory);
        escrowReleaseMessageFactory = app.IoC.getNamed<EscrowReleaseMessageFactory>(Types.Factory, Targets.Factory.message.EscrowReleaseMessageFactory);

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

        log.debug('templateGenerateParams:', JSON.stringify(templateGenerateParams, null, 2));

        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams: templateGenerateParams
        } as TestDataGenerateRequest);
        listingItemTemplate = listingItemTemplates[0];

        log.debug('listingItemTemplate:', JSON.stringify(listingItemTemplate, null, 2));

        const createdListingItemModel = await listingItemService.findOne(listingItemTemplate.ListingItems[0].id);
        listingItem = createdListingItemModel.toJSON();

        // expect template is related to correct profile and listingitem posted to correct market
        expect(listingItemTemplate.Profile.id).toBe(sellerProfile.id);
        expect(listingItemTemplate.ListingItems[0].marketId).toBe(defaultMarket.id);

        // expect template hash created on the server matches what we create here
        const generatedTemplateHash = ObjectHashDeprecated.getHash(listingItemTemplate, HashableObjectTypeDeprecated.LISTINGITEMTEMPLATE);
        log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        log.debug('generatedTemplateHash:', generatedTemplateHash);
        expect(listingItemTemplate.hash).toBe(generatedTemplateHash);

        // expect the item hash generated at the same time as template, matches with the templates one
        log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        log.debug('listingItemTemplate.ListingItems[0].hash:', listingItemTemplate.ListingItems[0].hash);
        expect(listingItemTemplate.hash).toBe(listingItemTemplate.ListingItems[0].hash);

        log.debug('listingItem:', JSON.stringify(listingItem, null, 2));

        // expect the ListingItem have no Bids and one ActionMessage at this point
        expect(listingItem.Bids).toHaveLength(0);

        // we now have:
        // - defaultProfile: Profile, for buyer
        // - sellerProfile: Profile, for seller
        // - listingItemTemplate, linked to seller profile
        // - listingItem, linked to template
        // - listingItem and template containing the same data with same hash
        // - listingItem having no Bids

    });

    afterAll(async () => {
        //
    });

    test('Should process MarketplaceMessageEvent containing MPA_BID BidMessage', async () => {

        // BUYER -> SELLER
        expect(listingItem).toBeDefined();

        // create bid.objects for MPA_BID
        const bidDatas = await bidActionService.generateBidDatasForMPA_BID_DEPRECATED(
            listingItem,
            [
                {id: 'size', value: 'XL'},
                {id: 'color', value: 'pink'},
                {id: 'outputs', value: '[{\"txid\":\"d39a1f90b7fd204bbdbaa49847c0615202c5624bc73634cd83d831e4a226ee0b\",\"vout\":1,\"amount\":100.52497491}]'},
                {id: 'pubkeys', value: '[\"021e3ccb8a295d6aca9cf2836587f24b1c2ce14b217fe85b1672ee133e2a5d6d90\"]'},
                {id: 'changeaddr', value: 'pbofM9onECpn76EosG1GLpyTcQCrfcLhb4'},
                {id: 'change', value: 96.52477491},
                {id: BidDataValue.SHIPPING_ADDRESS_FIRST_NAME, value: 'asdf'},
                {id: BidDataValue.SHIPPING_ADDRESS_LAST_NAME, value: 'asdf'},
                {id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE1, value: 'asdf'},
                {id: BidDataValue.SHIPPING_ADDRESS_ADDRESS_LINE2, value: 'asdf'},
                {id: BidDataValue.SHIPPING_ADDRESS_CITY, value: 'asdf'},
                {id: BidDataValue.SHIPPING_ADDRESS_STATE, value: ''},
                {id: BidDataValue.SHIPPING_ADDRESS_ZIP_CODE, value: '1234'},
                {id: BidDataValue.SHIPPING_ADDRESS_COUNTRY, value: 'FI'}
            ]
        );

        // create MPA_BID type of MarketplaceMessage
        const bidMessage: BidMessage = await bidMessageFactory.get(MPAction.MPA_BID, listingItem.hash, bidDatas);
        expect(bidMessage.item).toBe(listingItem.hash);

        const marketplaceMessage: MarketplaceMessage = {
            version: '0300',
            mpaction: bidMessage,
            market: defaultMarket.address
        };

        const smsgMessage: CoreSmsgMessage = {
            msgid: 'TESTMESSAGE' + new Date().getTime(),
            version: '0300',
            location: 'inbox',
            read: false,
            paid: false,
            payloadsize: 100,
            received: new Date().getTime(),
            sent: new Date().getTime(),
            expiration: new Date().getTime(),
            daysretention: 4,
            from: defaultProfile.address,
            to: sellerProfile.address,
            text: JSON.stringify(marketplaceMessage)
        };

        // process the message like it was received as MarketplaceMessageEvent
        const processingResult = await bidActionService.processBidReceivedEvent({
            smsgMessage,
            marketplaceMessage
        } as MarketplaceMessageEvent);

        expect(processingResult).toBe(SmsgMessageStatus.PROCESSED);

        const bidCollection = await bidService.findAllByListingItemHash(listingItem.hash);
        const bids = bidCollection.toJSON();
        const result = bids[0];

        log.debug('result.ListingItem.hash: ', result.ListingItem.hash);

        log.debug('bid: ', JSON.stringify(result, null, 2));

        expect(result.action).toBe(bidMessage.action);
        expect(result.bidder).toBe(smsgMessage.from);
        expect(result.ListingItem.hash).toBe(listingItem.hash);
        expect(result.ListingItem.ListingItemTemplate.hash).toBe(listingItem.hash);
        expect(result.ListingItem.seller).toBe(listingItem.seller);
        expect(result.ListingItem.seller).toBe(sellerProfile.address);
        expect(result.ListingItem.marketId).toBe(defaultMarket.id);
        expect(result.ShippingAddress.firstName).toBe('asdf');
        expect(result.ShippingAddress.lastName).toBe('asdf');
        expect(result.ShippingAddress.country).toBe('FI');
        expect(result.ShippingAddress.zipCode).toBe('1234');
        expect(result.ShippingAddress.type).toBe(AddressType.SHIPPING_BID);
        expect(result.BidDatas).toHaveLength(19);

        const createdListingItemModel = await listingItemService.findOneByHash(result.ListingItem.hash);
        listingItem = createdListingItemModel.toJSON();

        log.debug('listingItem.Bids: ', JSON.stringify(listingItem.Bids, null, 2));
        expect(listingItem.Bids).toHaveLength(1);

        bid = result;
    });

});

