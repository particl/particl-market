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

    const testUtilNode0 = new BlackBoxTestUtil(0);
    const testUtilNode1 = new BlackBoxTestUtil(1);
    // const testUtilNode2 = new BlackBoxTestUtil(2);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;

    const listingItemCommand = Commands.ITEM_ROOT.commandName;
    const listingItemGetCommand = Commands.ITEM_GET.commandName;

    let sellerProfile;
    let buyerProfile;
    let defaultMarket;

    let listingItemTemplatesNode0: resources.ListingItemTemplate[];

    beforeAll(async () => {

        await testUtilNode0.cleanDb();
        // await testUtilNode2.cleanDb();

        // get seller and buyer profiles
        sellerProfile = await testUtilNode0.getDefaultProfile();
        expect(sellerProfile.id).toBeDefined();

        buyerProfile = await testUtilNode1.getDefaultProfile();
        expect(buyerProfile.id).toBeDefined();

        log.debug('sellerProfile: ', JSON.stringify(sellerProfile, null, 2));
        log.debug('buyerProfile: ', JSON.stringify(buyerProfile, null, 2));

        defaultMarket = await testUtilNode0.getDefaultMarket();
        expect(defaultMarket.id).toBeDefined();

        log.debug('defaultMarket: ', JSON.stringify(defaultMarket, null, 2));

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,    // generateListingItemObjects
            false,  // generateObjectDatas
            sellerProfile.id,    // profileId
            false,   // generateListingItem
            defaultMarket.id     // marketId
        ]).toParamsArray();

        // generate listingItemTemplate
        listingItemTemplatesNode0 = await testUtilNode0.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        expect(listingItemTemplatesNode0[0].id).toBeDefined();

        // we should be also able to get the template
        const templateGetRes: any = await testUtilNode0.rpc(templateCommand, [templateGetCommand, listingItemTemplatesNode0[0].id]);
        templateGetRes.expectJson();
        templateGetRes.expectStatusCode(200);
        const result: any = templateGetRes.getBody()['result'];

        log.debug('listingItemTemplates[0].hash:', listingItemTemplatesNode0[0].hash);
        log.debug('result.hash:', result.hash);
        expect(result.hash).toBe(listingItemTemplatesNode0[0].hash);

    });

    test('Should post a ListingItemTemplate to the default marketplace from node0', async () => {

        // log.debug('listingItemTemplates[0]:', listingItemTemplatesNode0[0]);

        const templateIdToPost = listingItemTemplatesNode0[0].id;
        const templatePostRes: any = await testUtilNode0.rpc(templateCommand, [templatePostCommand, templateIdToPost, defaultMarket.id]);
        templatePostRes.expectJson();
        templatePostRes.expectStatusCode(200);

        // make sure we got the expected result from posting the template
        let result: any = templatePostRes.getBody()['result'];
        expect(result.result).toBe('Sent.');
        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);

        log.debug('===============================================================================');
        log.debug('id: ' + listingItemTemplatesNode0[0].id + ', ' + listingItemTemplatesNode0[0].ItemInformation.title);
        log.debug('desc: ' + listingItemTemplatesNode0[0].ItemInformation.shortDescription);
        log.debug('category: ' + listingItemTemplatesNode0[0].ItemInformation.ItemCategory.id + ', '
            + listingItemTemplatesNode0[0].ItemInformation.ItemCategory.name);
        log.debug('hash: ' + listingItemTemplatesNode0[0].hash);
        log.debug('===============================================================================');

        // await testUtilNode0.waitFor(5);

        // try to find the item from the other node

        const itemGetRes: any = await testUtilNode1.rpcWaitFor(
            listingItemCommand,
            [listingItemGetCommand, listingItemTemplatesNode0[0].hash],
            8 * 60,
            200,
            'hash',
            listingItemTemplatesNode0[0].hash
        );
        itemGetRes.expectJson();
        itemGetRes.expectStatusCode(200);

        // make sure we got the expected result
        result = itemGetRes.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplatesNode0[0].hash);

    }, 600000); // timeout to 600s

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
