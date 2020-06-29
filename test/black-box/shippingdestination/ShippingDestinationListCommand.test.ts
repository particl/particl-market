// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { GenerateListingItemParams } from '../../../src/api/requests/testdata/GenerateListingItemParams';
import { ListingItem } from '../../../src/api/models/ListingItem';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';
import {GenerateListingItemTemplateParams} from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';
import {InvalidParamException} from '../../../src/api/exceptions/InvalidParamException';

describe('ShippingDestinationListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shippingDestinationCommand = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const shippingDestinationListCommand = Commands.SHIPPINGDESTINATION_LIST.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItem: resources.ListingItem;
    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        // create ListingItemTemplate
        let generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,           // generateItemInformation
            true,           // generateItemLocation
            true,           // generateShippingDestinations
            false,          // generateItemImages
            true,           // generatePaymentInformation
            true,           // generateEscrow
            true,           // generateItemPrice
            true,           // generateMessagingInformation
            false,          // generateListingItemObjects
            false,          // generateObjectDatas
            profile.id,     // profileId
            false,          // generateListingItem
            market.id       // soldOnMarketId
        ]).toParamsArray();

        let listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];

        // create ListingItem
        generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,           // generateItemInformation
            true,           // generateItemLocation
            true,           // generateShippingDestinations
            false,          // generateItemImages
            true,           // generatePaymentInformation
            true,           // generateEscrow
            true,           // generateItemPrice
            true,           // generateMessagingInformation
            false,          // generateListingItemObjects
            false,          // generateObjectDatas
            profile.id,     // profileId
            true,           // generateListingItem
            market.id       // soldOnMarketId
        ]).toParamsArray();

        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        listingItem = listingItemTemplates[0].ListingItems[0];

    });

    test('Should fail to list ShippingDestinations because missing target', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('target').getMessage());
    });

    test('Should fail to list ShippingDestinations because missing id', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'item'
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('id').getMessage());
    });

    test('Should fail to list ShippingDestinations because invalid target (boolean)', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            false,
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('target', 'string').getMessage());
    });

    test('Should fail to list ShippingDestinations because invalid target (not item or template)', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'NOT_ITEM_OR_TEMPLATE',
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('target', 'item|template').getMessage());
    });

    test('Should fail to list ShippingDestinations because invalid id', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'item',
            false
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('id', 'number').getMessage());
    });


    test('Should list ShippingDestinations for ListingItemTemplate', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'template',
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShippingDestination[] = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));

        expect(result.length).toBe(listingItemTemplate.ItemInformation.ShippingDestinations.length);
    });

    test('Should list ShippingDestinations for ListingItemTemplate (uppercase template)', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'TEMPLATE',
            listingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ShippingDestination[] = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));

        expect(result.length).toBe(listingItemTemplate.ItemInformation.ShippingDestinations.length);
    });

    test('Should list ShippingDestinations for ListingItem', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'item',
            listingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        log.debug('result: ', JSON.stringify(result, null, 2));

        expect(result.length).toBe(listingItem.ItemInformation.ShippingDestinations.length);
    });

});



