// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ImageListCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const imageCommand = Commands.IMAGE_ROOT.commandName;
    const imageListCommand = Commands.IMAGE_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;
    let listingItem: resources.ListingItem;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,               // generateItemInformation
            true,               // generateItemLocation
            true,               // generateShippingDestinations
            true,               // generateImages
            true,               // generatePaymentInformation
            true,               // generateEscrow
            true,               // generateItemPrice
            false,              // generateMessagingInformation
            false,              // generateListingItemObjects
            false,              // generateObjectDatas
            profile.id,         // profileId
            true,               // generateListingItem
            market.id           // soldOnMarketId
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,     // what to generate
            1,                              // how many to generate
            true,                        // return model
            generateListingItemTemplateParams       // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        listingItemTemplate = listingItemTemplates[0];
        listingItem = listingItemTemplate.ListingItems[0];

    });


    test('Should fail because missing template|item|market', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('template|item|market').getMessage());
    });


    test('Should fail because missing id', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'item'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });


    test('Should fail because invalid template|item|market', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            true,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('template|item|market', 'string').getMessage());
    });


    test('Should fail because invalid id', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'item',
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('id', 'number').getMessage());
    });


    test('Should fail because ListingItemTemplate not found', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'template',
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });


    test('Should fail because Market not found', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'market',
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('Market').getMessage());
    });


    test('Should fail because ListingItem not found', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'item',
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItem').getMessage());
    });


    test('Should list all ListingItemTemplate Images', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'template',
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Image[] = res.getBody()['result'];
        // log.debug('result:', JSON.stringify(result, null, 2));
        expect(result.length).toBeGreaterThan(0);
    });


    test('Should list all ListingItem Images', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'item',
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Image[] = res.getBody()['result'];
        expect(result.length).toBeGreaterThan(0);
    });

    test('Should list all Market Images', async () => {
        const res: any = await testUtil.rpc(imageCommand, [imageListCommand,
            'item',
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.Image[] = res.getBody()['result'];
        expect(result.length).toBeGreaterThan(0);
    });

});
