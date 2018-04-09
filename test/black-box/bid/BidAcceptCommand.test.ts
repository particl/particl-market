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
import { GenerateProfileParams } from "../../../src/api/requests/params/GenerateProfileParams";
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { HashableObjectType } from '../../../src/api/enums/HashableObjectType';

describe('BidAcceptCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const bidCommand =  Commands.BID_ROOT.commandName;
    const acceptCommand = Commands.BID_ACCEPT.commandName;

    const dataCommand = Commands.DATA_ROOT.commandName;
    const generateCommand = Commands.DATA_GENERATE.commandName;

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

        // generate listingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams();
        generateListingItemTemplateParams.profileId = sellerProfile.id;

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams.toParamsArray()   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplates[0];

        // expect template is related to correct profile
        log.debug('listingItemTemplate.Profile.id:', listingItemTemplate.Profile.id);
        log.debug('sellerProfile.id:', sellerProfile.id);
        expect(listingItemTemplate.Profile.id).toBe(sellerProfile.id);

        // expect template hash created on the server matches what we create here
        const generatedTemplateHash = ObjectHash.getHash(listingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);
        log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        log.debug('generatedTemplateHash:', generatedTemplateHash);
        expect(listingItemTemplate.hash).toBe(generatedTemplateHash);

        // create ListingItemCreateRequest
        listingItemCreateRequestBasic1.market_id = defaultMarket.id;
        listingItemCreateRequestBasic1.listing_item_template_id = listingItemTemplate.id;
        listingItemCreateRequestBasic1.seller = sellerProfile.address;

        // expect listingItemCreateRequest also matches generatedTemplateHash
        const generatedListingItemCreateRequesHash = ObjectHash.getHash(listingItemTemplate, HashableObjectType.LISTINGITEM_CREATEREQUEST);
        expect(listingItemTemplate.hash).toBe(generatedListingItemCreateRequesHash);

        // expect listingItemCreateRequest also matches generatedTemplateHash

        listingItem = await testUtil.addData(CreatableModel.LISTINGITEM, listingItemCreateRequestBasic1);

        delete listingItemTemplate.ItemInformation.ItemImages;
        delete listingItem.ItemInformation.ItemImages;
        // log.debug('listingItemTemplate:', JSON.stringify(listingItemTemplate, null, 2);
        // log.debug('listingItem:', JSON.stringify(listingItem, null, 2);

        log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        log.debug('listingItem.hash:', listingItem.hash);

        // make sure the hashes match
        expect(listingItemTemplate.hash).toBe(listingItem.hash);

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
