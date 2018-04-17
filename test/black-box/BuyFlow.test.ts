///<reference path="../../node_modules/@types/jest/index.d.ts"/>
// tslint:disable:max-line-length
import {rpc, api, ApiOptions} from './lib/api';
import { Logger as LoggerType } from '../../src/core/Logger';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as listingItemTemplateCreateRequestWithoutLocationMarker from '../testdata/createrequest/listingItemTemplateCreateRequestWithoutLocationMarker.json';
import * as resources from 'resources';
// tslint:enable:max-line-length

describe('ListingItemSearchCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    // const testUtilNode0 = new BlackBoxTestUtil(0);
    const testUtilNode1 = new BlackBoxTestUtil(0);
    const testUtilNode2 = new BlackBoxTestUtil(1);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let sellerProfile;
    let buyerProfile;
    let defaultMarket;
    let listingItemTemplates: resources.ListingItemTemplate[];
    let postedTemplateId;

    beforeAll(async () => {

        await testUtilNode1.cleanDb();
        // await testUtilNode2.cleanDb();

        // get seller and buyer profiles
        sellerProfile = await testUtilNode1.getDefaultProfile();
        buyerProfile = await testUtilNode2.getDefaultProfile();

        log.debug('sellerProfile: ', sellerProfile);
        log.debug('buyerProfile: ', buyerProfile);

        defaultMarket = await testUtilNode1.getDefaultMarket();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true,    // generateListingItemObjects
            false,  // generateObjectDatas
            sellerProfile.id,    // profileId
            false,   // generateListingItem
            defaultMarket.id     // marketId
        ]).toParamsArray();

        // generate listingItemTemplate
        listingItemTemplates = await testUtilNode1.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

    });

    test('Should post a ListingItemTemplate to the default marketplace from node0', async () => {

        log.debug('listingItemTemplates[0]:', listingItemTemplates[0]);
        postedTemplateId = listingItemTemplates[0].id;
        const res: any = await testUtilNode1.rpc(templateCommand, [templatePostCommand, postedTemplateId, defaultMarket.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        log.debug('result', JSON.stringify(result, null, 2));

        expect(result.result).toBe('Sent.');
        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);

        testUtilNode1.waitFor(10000);
    });

    test('Should post a ListingItem in to the default marketplace without LocationMarker', async () => {
/*
        // generate listingItemTemplate
        listingItemTemplates = await testUtilNode0.addData(
            CreatableModel.LISTINGITEMTEMPLATE,
            listingItemTemplateCreateRequestWithoutLocationMarker
        ) as resources.ListingItemTemplates[];

        postedTemplateId = listingItemTemplates[0].id;
        const res: any = await rpc(templateCommand, [templatePostCommand, postedTemplateId, defaultMarket.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.result).toBe('Sent.');
        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);
*/
    });



});
