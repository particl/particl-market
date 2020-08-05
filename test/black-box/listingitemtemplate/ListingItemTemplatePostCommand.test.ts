// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as Faker from 'faker';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';
import { EscrowReleaseType, EscrowType, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';

describe('ListingItemTemplatePostCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;
    const templateGetCommand = Commands.TEMPLATE_GET.commandName;
    const templateAddCommand = Commands.TEMPLATE_ADD.commandName;
    const templateCloneCommand = Commands.TEMPLATE_CLONE.commandName;

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;
    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationUpdateCommand = Commands.ITEMLOCATION_UPDATE.commandName;
    const shippingDestinationCommand = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const shippingDestinationAddCommand = Commands.SHIPPINGDESTINATION_ADD.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    // let brokenListingItemTemplate: resources.ListingItemTemplate;

    let rootCategory: resources.ItemCategory;

    let sent = false;
    const daysRetention = 1;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        profile = await testUtil.getDefaultProfile();
        market = await testUtil.getDefaultMarket(profile.id);

        // generate ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            true,       // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            true,       // generateEscrow
            true,       // generateItemPrice
            true,       // generateMessagingInformation
            false,      // generateListingItemObjects
            false,      // generateObjectDatas
            profile.id, // profileId
            false,      // generateListingItem
            market.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
        // brokenListingItemTemplate = listingItemTemplates[1];

        // get the default root category
        const res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        rootCategory = res.getBody()['result'];
    });

    test('Should fail to post because missing listingItemTemplateId', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to post because missing daysRetention', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('daysRetention').getMessage());
    });

    test('Should fail to add because invalid listingItemTemplateId', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            'INVALID',
            daysRetention
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail to add because invalid daysRetention', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('daysRetention', 'number').getMessage());
    });

    test('Should fail to add because invalid estimateFee', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('estimateFee', 'boolean').getMessage());
    });

    test('Should fail to add because ListingItemTemplate not found', async () => {
        const res = await testUtil.rpc(templateCommand, [templatePostCommand,
            0,
            daysRetention,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });

    test('Should estimate post cost without actually posting', async () => {

        expect(listingItemTemplate.id).toBeDefined();
        const res: any = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention,
            true
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.result).toBe('Not Sent.');

        log.debug('==[ ESTIMATED COST ON ITEM ]==================================================================');
        log.debug('id: ' + listingItemTemplate.id + ', ' + listingItemTemplate.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplate.ItemInformation.shortDescription);
        log.debug('fee: ' + result.fee);
        log.debug('==============================================================================================');

    });

    test('Should post a ListingItem in to the default market', async () => {

        expect(listingItemTemplate.id).toBeDefined();
        const res: any = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention
        ]);
        res.expectJson();

        // make sure we got the expected result from posting the template
        const result: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        sent = result.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(result, null, 2));
        }
        expect(result.result).toBe('Sent.');

        log.debug('==[ POSTED ITEM ]=============================================================================');
        log.debug('id: ' + listingItemTemplate.id + ', ' + listingItemTemplate.ItemInformation.title);
        log.debug('desc: ' + listingItemTemplate.ItemInformation.shortDescription);
        log.debug('category: ' + listingItemTemplate.ItemInformation.ItemCategory.id + ', '
            + listingItemTemplate.ItemInformation.ItemCategory.name);
        log.debug('==============================================================================================');

    });

    test('Should get the updated ListingItemTemplate with the hash', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateGetCommand,
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplate = res.getBody()['result'];

        expect(listingItemTemplate.hash).toBeDefined();
        log.debug('listingItemTemplate.hash: ', listingItemTemplate.hash);

    });

    test('Should post ListingItemTemplate created using the basic gui flow', async () => {

        // pick a random category
        // log.debug('rootCategory: ', JSON.stringify(rootCategory, null, 2));
        const childCat: resources.ItemCategory = Faker.random.arrayElement(rootCategory.ChildItemCategories);
        const category: resources.ItemCategory = Faker.random.arrayElement(childCat.ChildItemCategories);

        // create new base template
        let res: any = await testUtil.rpc(templateCommand, [templateAddCommand,
            profile.id,                     // profile_id
            'Test02',                       // title
            'Test02 Summary',               // shortDescription
            'Test02 Long Description',      // longDescription
            category.id,                    // categoryId
            SaleType.SALE,                  // SaleType
            Cryptocurrency.PART,            // Cryptocurrency
            1000,                           // basePrice
            300,                            // domesticShippingPrice
            600,                            // internationalShippingPrice
            EscrowType.MAD_CT,              // EscrowType
            100,                            // buyerRatio
            100,                            // sellerRatio
            EscrowReleaseType.ANON          // EscrowReleaseType
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplate = res.getBody()['result'];

        // log.debug('listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));

        expect(listingItemTemplate.id).toBeGreaterThan(0);

        // update template location
        let country = 'AU';
        res = await testUtil.rpc(itemLocationCommand, [itemLocationUpdateCommand,
            listingItemTemplate.id,
            country
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const itemLocation: resources.ItemLocation = res.getBody()['result'];

        expect(itemLocation.country).toBe(country);

        // add some shipping destinations
        country = 'AU';
        res = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id,
            country,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        let shippingDestination: resources.ShippingDestination = res.getBody()['result'];
        expect(shippingDestination.country).toBe(country);

        country = 'ZA';
        res = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id,
            country,
            ShippingAvailability.SHIPS
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        shippingDestination = res.getBody()['result'];
        expect(shippingDestination.country).toBe(country);

        country = 'US';
        res = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationAddCommand,
            listingItemTemplate.id,
            country,
            ShippingAvailability.DOES_NOT_SHIP
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        shippingDestination = res.getBody()['result'];
        expect(shippingDestination.country).toBe(country);

        // create market template from the base template
        res = await testUtil.rpc(templateCommand, [templateCloneCommand,
            listingItemTemplate.id,
            true,                       // setOriginalAsParent
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        listingItemTemplate = res.getBody()['result'];
        // log.debug('listingItemTemplate: ', JSON.stringify(listingItemTemplate, null, 2));

        // do a fee estimation (via a post)
        expect(listingItemTemplate.id).toBeDefined();
        res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention,
            true
        ]);
        res.expectJson();

        const estimateResult: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(estimateResult, null, 2));

        expect(estimateResult.result).toBe('Not Sent.');

        // post the item
        res = await testUtil.rpc(templateCommand, [templatePostCommand,
            listingItemTemplate.id,
            daysRetention
        ]);
        res.expectJson();

        const postResult: any = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(postResult, null, 2));
        sent = postResult.result === 'Sent.';
        if (!sent) {
            log.debug(JSON.stringify(postResult, null, 2));
        }
        expect(postResult.result).toBe('Sent.');

    });
});
