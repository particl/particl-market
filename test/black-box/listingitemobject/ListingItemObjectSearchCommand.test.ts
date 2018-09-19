// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as _ from 'lodash';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { ListingItemObjectType } from '../../../src/api/enums/ListingItemObjectType';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';

describe('ListingItemObjectSearchCommand', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const itemObjectCommand = Commands.ITEMOBJECT_ROOT.commandName;
    const itemObjectsearchCommand = Commands.ITEMOBJECT_SEARCH.commandName;

    const testUtil = new BlackBoxTestUtil();

    let listingItemObjects: resources.ListingItemObject[];

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

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        listingItemObjects = listingItemTemplates[0].ListingItemObjects;
    });

    test('Should fail to search ListingItemObject when missing the searchString', async () => {
        const res: any = await testUtil.rpc(itemObjectCommand, [itemObjectsearchCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe('Missing searchString.');
    });

    test('Should search empty ListingItemObject for the invalid string search', async () => {
        const res: any = await testUtil.rpc(itemObjectCommand, [itemObjectsearchCommand, 'dapp']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });

    test('Should return ListingItemObjects searched by type', async () => {

        const type: ListingItemObjectType = listingItemObjects[0].type;
        const typeCount = _.sumBy(listingItemObjects, lio => (lio.type === type ? 1 : 0));

        const res: any = await testUtil.rpc(itemObjectCommand, [itemObjectsearchCommand, type]);
        res.expectJson();
        res.expectStatusCode(200);
        const results: any = res.getBody()['result'];

        expect(results.length).toBe(typeCount);
        for (const result of results) {
            expect(result.type).toBe(type);
        }
    });

    test('Should return all ListingItemObjects searched by description', async () => {
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

