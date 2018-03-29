import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { addressTestData } from './BidCommandCommon';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';

import * as resources from 'resources';
import * as listingItemCreateRequestBasic1 from '../testdata/createrequest/listingItemCreateRequestBasic1.json';
import * as listingItemCreateRequestBasic2 from '../testdata/createrequest/listingItemCreateRequestBasic2.json';
import * as listingItemCreateRequestBasic3 from '../testdata/createrequest/listingItemCreateRequestBasic3.json';

describe('BidSendCommand', () => {

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const sendCommand =  Commands.BID_SEND.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdListingItem1: resources.ListingItem;
    let createdListingItem2: resources.ListingItem;

    beforeAll(async () => {

        await testUtil.cleanDb();

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();

        // create address for default profile
        const addressRes = await rpc(Commands.ADDRESS_ROOT.commandName, [Commands.ADDRESS_ADD.commandName,
            defaultProfile.id,
            addressTestData.title,
            addressTestData.addressLine1, addressTestData.addressLine2,
            addressTestData.city, addressTestData.state, addressTestData.country, addressTestData.zipCode]);

        // get default profile again
        defaultProfile = await testUtil.getDefaultProfile();

        // get default market
        defaultMarket = await testUtil.getDefaultMarket();

        // create a listing item to bid for
        listingItemCreateRequestBasic1.market_id = defaultMarket.id;
        listingItemCreateRequestBasic1.hash = 'hash-asdf1';
        createdListingItem1 = await testUtil.addData(CreatableModel.LISTINGITEM, listingItemCreateRequestBasic1);

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // generate listingItemTemplate
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        createdListingItemTemplate = listingItemTemplates[0];

        // create listing item for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,     // what to generate
            1,                      // how many to generate
            true,                // return model
            generateListingItemParams           // what kind of data to generate
        ) as resources.ListingItem[];
        createdListingItem1 = listingItems[0];

        // create second listing item
        listingItemCreateRequestBasic2.market_id = defaultMarket.id;
        listingItemCreateRequestBasic2.listing_item_template_id = listingItemTemplates[0].id;
        listingItemCreateRequestBasic1.hash = 'hash-asdf2';

        createdListingItem2 = await testUtil.addData(CreatableModel.LISTINGITEM, listingItemCreateRequestBasic2);

    });

    test('Should send Bid for a ListingItem', async () => {

        // create listing item
        // TODO: Add address to bid...

        const res: any = await rpc(bidCommand, [sendCommand, 'colour', 'black', 'size', 'xl']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        // TODO: Need to implements after broadcast functionality get done
    });

});
