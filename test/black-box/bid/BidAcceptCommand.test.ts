import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { BidCreateRequest } from '../../../src/api/requests/BidCreateRequest';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { addressTestData } from './BidCommandCommon';
import { AddressCreateRequest } from '../../../src/api/requests/AddressCreateRequest';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';

import * as resources from 'resources';
import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';

describe('BidAcceptCommand', () => {

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const acceptCommand = Commands.BID_ACCEPT.commandName;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let listingItem: resources.ListingItem;
    let createdBid: resources.Bid;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();

        // create address
        const addressRes = await rpc(Commands.ADDRESS_ROOT.commandName, [Commands.ADDRESS_ADD.commandName,
            defaultProfile.id,
            addressTestData.firstName, addressTestData.lastName, addressTestData.title,
            addressTestData.addressLine1, addressTestData.addressLine2,
            addressTestData.city, addressTestData.state, addressTestData.country, addressTestData.zipCode]);

        // get default profile again - to update
        defaultProfile = await testUtil.getDefaultProfile();

        // get default market
        defaultMarket = await testUtil.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
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
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        const createdListingItemTemplate = listingItemTemplates[0];

        // create listing item
        listingItemCreateRequestBasic1.market_id = defaultMarket.id;
        listingItemCreateRequestBasic1.listing_item_template_id = createdListingItemTemplate.id;

        listingItem = await testUtil.addData(CreatableModel.LISTINGITEM, listingItemCreateRequestBasic1);

        // Ryno Hacks - This requires regtest
        // This needs to be updated whenever regtest allocations change
        const outputs = [{
            txid: 'e3fd6c39588c5e9fc5cd2d0626f21735936f8ab07c6b7f535618614f2ca989a8',
            vout: 1,
            amount: 20000
        }];

        const pubkey = '02dcd01e1c1bde4d5f8eff82cde60017f81ac1c2888d04f47a31660004fe8d4bb7';
        const changeAddress = 'pYTjD9CRepFvh1YvVfowY2J14DK9ayrvrr';

        // create bid
        const bidCreateRequest = {
            action: BidMessageType.MPA_BID,
            listing_item_id: listingItem.id,
            bidder: 'bidderaddress',
            bidDatas: [
                { dataId: 'COLOR', dataValue: 'RED' },
                { dataId: 'SIZE', dataValue: 'XL' },
                { dataId: 'pubkeys', dataValue: [pubkey] },
                { dataId: 'outputs', dataValue: outputs },
                { dataId: 'changeAddr', dataValue: changeAddress },
                { dataId: 'change', dataValue: +(listingItem.PaymentInformation.ItemPrice.basePrice
                    + listingItem.PaymentInformation.ItemPrice.ShippingPrice.international).toFixed(8) }],
            address: {
                title: 'Title',
                firstName: 'Robert',
                lastName: 'Downey',
                addressLine1: 'Add',
                addressLine2: 'ADD 22',
                city: 'city',
                state: 'test state',
                country: 'Finland',
                zipCode: '85001'
            } as AddressCreateRequest
        } as BidCreateRequest;

        createdBid = await testUtil.addData(CreatableModel.BID, bidCreateRequest);
    });

    test('Should Accept a Bid for a ListingItem', async () => {

        const res: any = await rpc(bidCommand, [acceptCommand, listingItem.hash, createdBid.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
    });

});
