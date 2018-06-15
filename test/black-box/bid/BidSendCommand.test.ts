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

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;

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
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams();
        generateListingItemTemplateParams.profileId = sellerProfile.id;
        generateListingItemTemplateParams.generateListingItem = true;
        generateListingItemTemplateParams.marketId = defaultMarket.id;

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams.toParamsArray()   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplates[0];

        // delete listingItemTemplate.ItemInformation.ItemImages;
        // log.debug('listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));

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

        // set the listingItem
        const listingItemRes = await rpc(itemCommand, [getCommand, listingItemTemplate.ListingItems[0].hash]);
        listingItemRes.expectJson();
        listingItemRes.expectStatusCode(200);
        listingItem = listingItemRes.getBody()['result'];

    });

    test('Should post Bid for a ListingItem', async () => {

        log.debug('listingItem.hash: ', listingItem.hash);
        // log.debug('createdListingItems[0].ActionMessages: ', JSON.stringify(createdListingItems[0].ActionMessages, null, 2));
        log.debug('profile.shippingAddress:', JSON.stringify(defaultProfile.ShippingAddresses[0], null, 2));

        const bidSendCommandParams = [
            sendCommand,
            listingItem.hash,
            defaultProfile.id,
            defaultProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        // send bid
        const res: any = await rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });

    test('Should create bid with address from bidData without addressId', async () => {

        log.debug('listingItem.hash: ', listingItem.hash);
        // log.debug('createdListingItems[0].ActionMessages: ', JSON.stringify(createdListingItems[0].ActionMessages, null, 2));
        log.debug('profile.shippingAddress:', JSON.stringify(defaultProfile.ShippingAddresses[0], null, 2));

        const bidSendCommandParams = [
            sendCommand,
            listingItem.hash,
            defaultProfile.id,
            false,
            'SHIPPING_ADDRESS_FIRST_NAME',
            'Johnny',
            'SHIPPING_ADDRESS_LAST_NAME',
            'Depp',
            'SHIPPING_ADDRESS_ADDRESS_LINE1',
            '123 6th St',
            'SHIPPING_ADDRESS_ADDRESS_LINE2',
            'Melbourne, FL 32904',
            'SHIPPING_ADDRESS_CITY',
            'Melbourne',
            'SHIPPING_ADDRESS_STATE',
            'Mel State',
            'SHIPPING_ADDRESS_COUNTRY',
            'Finland',
            'SHIPPING_ADDRESS_ZIP_CODE',
            '85001'
        ];

        // send bid
        const res: any = await rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('result', result);
        expect(result.result).toBe('Sent.');
    });


    test('Should not create bid with address from bidData without addressId', async () => {

        log.debug('listingItem.hash: ', listingItem.hash);
        // log.debug('createdListingItems[0].ActionMessages: ', JSON.stringify(createdListingItems[0].ActionMessages, null, 2));
        log.debug('profile.shippingAddress:', JSON.stringify(defaultProfile.ShippingAddresses[0], null, 2));

        const bidSendCommandParams = [
            sendCommand,
            listingItem.hash,
            defaultProfile.id,
            false,
            'SHIPPING_ADDRESS_FIRST_NAME',
            'Johnny',
            'SHIPPING_ADDRESS_LAST_NAME',
            'Depp',
            'SHIPPING_ADDRESS_ADDRESS_LINE2',
            'Melbourne, FL 32904',
            'SHIPPING_ADDRESS_CITY',
            'Melbourne',
            'SHIPPING_ADDRESS_STATE',
            'Mel State',
            'SHIPPING_ADDRESS_COUNTRY',
            'Finland',
            'SHIPPING_ADDRESS_ZIP_CODE',
            '85001'
        ];

        // send bid
        const res: any = await rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Incorrect address data in bidData.');
    });



    test('Should throw exception for incorrect profile', async () => {

        log.debug('listingItem.hash: ', listingItem.hash);
        // log.debug('createdListingItems[0].ActionMessages: ', JSON.stringify(createdListingItems[0].ActionMessages, null, 2));
        log.debug('profile.shippingAddress:', JSON.stringify(defaultProfile.ShippingAddresses[0], null, 2));

        const bidSendCommandParams = [
            sendCommand,
            listingItem.hash,
            7,
            defaultProfile.ShippingAddresses[0].id,
            'colour',
            'black',
            'size',
            'xl'
        ];

        // send bid
        const res: any = await rpc(bidCommand, bidSendCommandParams);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('No correct profile id.');
    });

    test('Should find Bid after posting', async () => {

        log.debug('createdListingItems[0].hash: ', listingItem.hash);

        // bid search (<itemhash>|*) [(<status>|*) [<bidderAddress> ...]
        const bidSearchCommandParams = [
            searchCommand,
            listingItem.hash,
            BidMessageType.MPA_BID,
            defaultProfile.address
        ];

        const res: any = await rpc(bidCommand, bidSearchCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        log.debug('bid search result:', JSON.stringify(result, null, 2));
        expect(result[0].ListingItem.hash).toBe(listingItem.hash);
        expect(result[0].action).toBe(BidMessageType.MPA_BID);
        expect(result[0].bidder).toBe(defaultProfile.address);
    });

});
