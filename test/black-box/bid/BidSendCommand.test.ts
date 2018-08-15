// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';

import * as resources from 'resources';
import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import {GenerateProfileParams} from '../../../src/api/requests/params/GenerateProfileParams';
import {SearchOrder} from '../../../src/api/enums/SearchOrder';

describe('BidSendCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const sendCommand =  Commands.BID_SEND.commandName;
    const searchCommand =  Commands.BID_SEARCH.commandName;

    const dataCommand = Commands.DATA_ROOT.commandName;
    const generateCommand = Commands.DATA_GENERATE.commandName;

    const itemCommand = Commands.ITEM_ROOT.commandName;
    const getCommand = Commands.ITEM_GET.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let sellerProfile: resources.Profile;

    let listingItem1: resources.ListingItem;
    let listingItem2: resources.ListingItem;

    const PAGE = 0;
    const PAGE_LIMIT = 10;
    const ORDERING = SearchOrder.ASC;

    beforeAll(async () => {

        await testUtil.cleanDb();

        // get default profile - testUtil will add one shipping address to it unless one allready exists
        defaultProfile = await testUtil.getDefaultProfile();

        // get default market
        defaultMarket = await testUtil.getDefaultMarket();

        // generate local seller profile
        const generateProfileParams = new GenerateProfileParams([true, false]).toParamsArray();
        const res = await rpc(dataCommand, [generateCommand, CreatableModel.PROFILE, 1, true].concat(generateProfileParams));
        res.expectJson();
        res.expectStatusCode(200);
        sellerProfile = res.getBody()['result'][0];
        log.debug('sellerProfile:', JSON.stringify(sellerProfile, null, 2));

        // generate ListingItemTemplate with ListingItem
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

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            2,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        // expect template is related to correct profile and listingitem posted to correct market
        expect(listingItemTemplates[0].Profile.id).toBe(sellerProfile.id);
        expect(listingItemTemplates[0].ListingItems[0].marketId).toBe(defaultMarket.id);

        // expect template hash created on the server matches what we create here
        const generatedTemplateHash = ObjectHash.getHash(listingItemTemplates[0], HashableObjectType.LISTINGITEMTEMPLATE);
        // log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        // log.debug('generatedTemplateHash:', generatedTemplateHash);
        expect(listingItemTemplates[0].hash).toBe(generatedTemplateHash);

        // expect the item hash generated at the same time as template, matches with the templates one
        expect(listingItemTemplates[0].hash).toBe(listingItemTemplates[0].ListingItems[0].hash);

        // get the listingItem
        let listingItemRes = await testUtil.rpc(itemCommand, [getCommand, listingItemTemplates[0].ListingItems[0].hash]);
        listingItemRes.expectJson();
        listingItemRes.expectStatusCode(200);
        listingItem1 = listingItemRes.getBody()['result'];

        // get the second listingItem
        listingItemRes = await testUtil.rpc(itemCommand, [getCommand, listingItemTemplates[1].ListingItems[0].hash]);
        listingItemRes.expectJson();
        listingItemRes.expectStatusCode(200);
        listingItem2 = listingItemRes.getBody()['result'];

    });

    test('Should post Bid for a ListingItem with addressId', async () => {

        log.debug('listingItem.hash: ', listingItem1.hash);
        log.debug('profile.shippingAddress:', JSON.stringify(defaultProfile.ShippingAddresses[0], null, 2));

        const bidSendCommandParams = [
            sendCommand,
            listingItem1.hash,
            defaultProfile.id,
            defaultProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        // send bid
        const res: any = await testUtil.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });

    test('Should post a Bid with address from bidData without addressId', async () => {

        log.debug('listingItem.hash: ', listingItem1.hash);
        log.debug('profile.shippingAddress:', JSON.stringify(defaultProfile.ShippingAddresses[0], null, 2));

        const bidSendCommandParams = [
            sendCommand,
            listingItem2.hash,
            defaultProfile.id,
            false,
            'ship.firstName',
            'Johnny',
            'ship.lastName',
            'Depp',
            'ship.addressLine1',
            '123 6th St',
            'ship.addressLine2',
            'Melbourne, FL 32904',
            'ship.city',
            'Melbourne',
            'ship.state',
            'Mel State',
            'ship.country',
            'Finland',
            'ship.zipCode',
            '85001'
        ];

        // send bid
        const res: any = await testUtil.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });


    test('Should not create bid with address from bidData without addressId', async () => {

        log.debug('listingItem.hash: ', listingItem1.hash);
        log.debug('profile.shippingAddress:', JSON.stringify(defaultProfile.ShippingAddresses[0], null, 2));

        const bidSendCommandParams = [
            sendCommand,
            listingItem1.hash,
            defaultProfile.id,
            false,
            'ship.firstName',
            'Johnny',
            'ship.lastName',
            'Depp',
            'ship.addressLine2',
            'Melbourne, FL 32904',
            'ship.city',
            'Melbourne',
            'ship.state',
            'Mel State',
            'ship.country',
            'Finland',
            'ship.zipCode',
            '85001'
        ];

        // send bid
        const res: any = await testUtil.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Missing required param: ship.addressLine1');
    });

    test('Should throw exception for invalid profile', async () => {

        log.debug('listingItem.hash: ', listingItem1.hash);
        log.debug('profile.shippingAddress:', JSON.stringify(defaultProfile.ShippingAddresses[0], null, 2));

        const bidSendCommandParams = [
            sendCommand,
            listingItem1.hash,
            7,
            defaultProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        // send bid
        const res: any = await testUtil.rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('No correct profile id.');
    });

    test('Should find Bid after posting', async () => {

        await testUtil.waitFor(5);

        log.debug('createdListingItems[0].hash: ', listingItem1.hash);

        const bidSearchCommandParams = [
            searchCommand,
            PAGE, PAGE_LIMIT, ORDERING,
            listingItem1.hash,
            BidMessageType.MPA_BID,
            '*',
            defaultProfile.address
        ];

        const res: any = await testUtil.rpc(bidCommand, bidSearchCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('bid search result:', JSON.stringify(result, null, 2));
        expect(result[0].ListingItem.hash).toBe(listingItem1.hash);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].bidder).toBe(defaultProfile.address);
    });

});
