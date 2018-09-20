// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem } from '../../../src/api/models/ListingItem';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from 'resources';

describe('ShippingDestinationListCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const shippingDestinationCommand = Commands.SHIPPINGDESTINATION_ROOT.commandName;
    const shippingDestinationListCommand = Commands.SHIPPINGDESTINATION_LIST.commandName;

    let createdListingItem: resources.ListingItem;
    let createdListingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // create template without shipping destinations and store its id for testing
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,                 // what to generate
            1,                                          // how many to generate
            true,                                   // return model
            new GenerateListingItemParams().toParamsArray()     // all true -> generate everything
        ) as ListingItemTemplate[];
        createdListingItemTemplate = listingItemTemplates[0];

        // create listing item with shipping destinations (1-5) and store its id for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,                         // generate listing item
            1,                                          // just one
            true,                                    // return model
            new GenerateListingItemParams().toParamsArray()     // all true -> generate everything
        ) as ListingItem[];
        createdListingItem = listingItems[0];
    });

    test('Should list ShippingDestinations for ListingItemTemplate', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'template',
            createdListingItemTemplate.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBeGreaterThan(0);
    });

    test('Should list ShippingDestinations for ListingItem', async () => {
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'item',
            createdListingItem.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBeGreaterThan(0);
    });

    test('Should fail to list ShippingDestinations for nonexisting ListingItemTemplate', async () => {
        const invalidId = 0;
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'template',
            invalidId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Entity with identifier 0 does not exist');
    });

    test('Should fail to list ShippingDestinations for nonexisting ListingItem', async () => {
        const invalidId = 0;
        const res: any = await testUtil.rpc(shippingDestinationCommand, [shippingDestinationListCommand,
            'item',
            invalidId
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Entity with identifier 0 does not exist');
    });

});



