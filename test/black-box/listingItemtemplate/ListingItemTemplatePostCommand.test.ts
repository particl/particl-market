import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';

import * as listingItemCreateRequestBasic1 from '../../testdata/createrequest/listingItemCreateRequestBasic1.json';
import * as listingItemCreateRequestBasic2 from '../../testdata/createrequest/listingItemCreateRequestBasic2.json';
import * as listingItemCreateRequestBasic3 from '../../testdata/createrequest/listingItemCreateRequestBasic3.json';

import * as listingItemUpdateRequestBasic1 from '../../testdata/pdaterequest/listingItemUpdateRequestBasic1.json';

import * as listingItemTemplateCreateRequestBasic1 from '../../testdata/createrequest/listingItemTemplateCreateRequestBasic1.json';
import * as listingItemTemplateCreateRequestBasic2 from '../../testdata/createrequest/listingItemTemplateCreateRequestBasic2.json';

import * as resources from 'resources';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';

describe('ListingItemSearchCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let defaultProfile;
    let defaultMarket;
    let listingItemTemplates: resources.ListingItemTemplate[];
    let postedTemplateId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();

        // fetch default market
        defaultMarket = await testUtil.getDefaultMarket();

        // generate listingItemTemplate
        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

    });

    test('Should post a ListingItem in to the default marketplace', async () => {
        postedTemplateId = listingItemTemplates[0].id;
        const res: any = await rpc(templateCommand, [templatePostCommand, postedTemplateId, defaultMarket.id]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: any = res.getBody()['result'];
        expect(result.result).toBe('Sent.');
        expect(result.txid).toBeDefined();
        expect(result.fee).toBeGreaterThan(0);
    });



});
