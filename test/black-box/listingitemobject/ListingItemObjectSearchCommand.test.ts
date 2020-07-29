// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { ListingItemObjectType } from '../../../src/api/enums/ListingItemObjectType';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ListingItemObjectSearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const itemObjectCommand = Commands.ITEMOBJECT_ROOT.commandName;
    const itemObjectsearchCommand = Commands.ITEMOBJECT_SEARCH.commandName;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemObjects: resources.ListingItemObject[];

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,                           // generateItemInformation
            true,                           // generateItemLocation
            true,                           // generateShippingDestinations
            false,                          // generateItemImages
            true,                           // generatePaymentInformation
            true,                           // generateEscrow
            true,                           // generateItemPrice
            true,                           // generateMessagingInformation
            true,                           // generateListingItemObjects
            true,                           // generateObjectDatas
            profile.id,                     // profileId
            true,                           // generateListingItem
            market.id,                      // soldOnMarketId
            undefined                       // categoryId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        listingItemObjects = listingItemTemplates[0].ListingItemObjects;
    });

    test('Should fail because missing searchString', async () => {
        const res: any = await testUtil.rpc(itemObjectCommand, [itemObjectsearchCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('searchString').getMessage());
    });

    test('Should fail because invalid searchString', async () => {
        const res: any = await testUtil.rpc(itemObjectCommand, [itemObjectsearchCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('searchString', 'string').getMessage());
    });

    test('Should not find any ListingItemObjects when the search string doesnt match', async () => {
        const res: any = await testUtil.rpc(itemObjectCommand, [itemObjectsearchCommand,
            'NO_MATCH'
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should find ListingItemObjects by type', async () => {

        const type: ListingItemObjectType = listingItemObjects[0].type;
        const typeCount = _.sumBy(listingItemObjects, lio => (lio.type === type ? 1 : 0));

        log.debug('listingItemObjects: ', JSON.stringify(listingItemObjects, null, 2));
        log.debug('type: ', JSON.stringify(type, null, 2));
        const res: any = await testUtil.rpc(itemObjectCommand, [itemObjectsearchCommand,
            type
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const results: any = res.getBody()['result'];

        expect(results.length).toBe(typeCount);
        for (const result of results) {
            expect(result.type).toBe(type);
        }
    });

    test('Should find ListingItemObjects by description', async () => {
        const description: ListingItemObjectType = listingItemObjects[0].description;
        const descriptionCount = _.sumBy(listingItemObjects, lio => (lio.description === description ? 1 : 0));

        const res: any = await testUtil.rpc(itemObjectCommand, [itemObjectsearchCommand, description]);
        res.expectJson();
        res.expectStatusCode(200);
        const results: any = res.getBody()['result'];

        expect(results.length).toBe(descriptionCount);
        for (const result of results) {
            expect(result.description).toBe(description);
        }
    });

});

