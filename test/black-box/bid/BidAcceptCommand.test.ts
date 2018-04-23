import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { BidCreateRequest } from '../../../src/api/requests/BidCreateRequest';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { AddressCreateRequest } from '../../../src/api/requests/AddressCreateRequest';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';

import * as resources from 'resources';
import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';
import * as addressCreateRequest from '../../testdata/createrequest/addressCreateRequestSHIPPING_OWN.json';
import { GenerateProfileParams } from '../../../src/api/requests/params/GenerateProfileParams';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';
import {AddressType} from '../../../src/api/enums/AddressType';

describe('BidAcceptCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const acceptCommand = Commands.BID_ACCEPT.commandName;
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

    let bid: resources.Bid;

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

        // get the listingItem
        const listingItemRes = await rpc(itemCommand, [getCommand, listingItemTemplate.ListingItems[0].hash]);
        listingItemRes.expectJson();
        listingItemRes.expectStatusCode(200);
        listingItem = listingItemRes.getBody()['result'];

        // ---
        // Ryno Hacks - This requires regtest
        // This needs to be updated whenever regtest allocations change
        const outputs = [{
            txid: 'e3fd6c39588c5e9fc5cd2d0626f21735936f8ab07c6b7f535618614f2ca989a8',
            vout: 1,
            amount: 20000
        }];

        const pubkey = '02dcd01e1c1bde4d5f8eff82cde60017f81ac1c2888d04f47a31660004fe8d4bb7';
        const changeAddress = 'pYTjD9CRepFvh1YvVfowY2J14DK9ayrvrr';

        // TODO: make it possible to pass bidDatas to bid test data generation

        // create bid, defaultProfile is bidder, sellerProfile is seller
        const bidCreateRequest = {
            action: BidMessageType.MPA_BID,
            listing_item_id: listingItem.id,
            bidder: defaultProfile.id,
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
                zipCode: '85001',
                type: AddressType.SHIPPING_BID
            } as AddressCreateRequest
        } as BidCreateRequest;

        bid = await testUtil.addData(CreatableModel.BID, bidCreateRequest);

    });

    test('Should Accept a Bid for a ListingItem', async () => {

        let res: any = await rpc(bidCommand, [acceptCommand, listingItem.hash, bid.id]);
        res.expectJson();
        res.expectStatusCode(200);
        let result: any = res.getBody()['result'];

        const bidSearchCommandParams = [
            searchCommand,
            listingItem.hash,
            BidMessageType.MPA_BID,
            defaultProfile.address
        ];

        res = await rpc(bidCommand, bidSearchCommandParams);
        res.expectJson();
        res.expectStatusCode(200);
        result = res.getBody()['result'];

        log.debug('bid search result:', JSON.stringify(result, null, 2));
        expect(result[0].ListingItem.hash).toBe(listingItem.hash);
        expect(result[0].action).toBe(BidMessageType.MPA_ACCEPT);
        expect(result[0].bidder).toBe(defaultProfile.address);
    });

});
