// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ItemLocationAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationAddCommand = Commands.ITEMLOCATION_ADD.commandName;

    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates First',
            shortDescription: 'Item short description with Templates First',
            longDescription: 'Item long description with Templates First',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        }
    };

    let createdTemplateId;
    // let createdItemLocation;

    const testData = [itemLocationAddCommand, 0, 'CN', 'USA', 'TITLE', 'TEST DESCRIPTION', 25.7, 22.77];

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);

        createdTemplateId = addListingItemTempRes.id;
    });

    test('Should not create ItemLocation without country', async () => {
        const addDataRes: any = await testUtil.rpc(itemLocationCommand, [itemLocationAddCommand]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Country code can\'t be blank.');
    });

    test('Should create ItemLocation', async () => {
        // Add Item Location
        testData[1] = createdTemplateId;
        const addDataRes: any = await testUtil.rpc(itemLocationCommand, testData);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];
        expect(result.LocationMarker).toBeDefined();
        expect(result.itemInformationId).toBeDefined();
        expect(result.region).toBe(testData[2]);
        expect(result.address).toBe(testData[3]);
        expect(result.LocationMarker.markerTitle).toBe(testData[4]);
        expect(result.LocationMarker.markerText).toBe(testData[5]);
        expect(result.LocationMarker.lat).toBe(testData[6]);
        expect(result.LocationMarker.lng).toBe(testData[7]);
    });

    test('Should create ItemLocation if ItemLocation already exist for listingItemtemplate', async () => {
        // Add Item Location
        const addDataRes: any = await testUtil.rpc(itemLocationCommand, testData);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe(`ItemLocation with the listingItemTemplateId=${testData[1]} already exists`);
    });

    test('Should create ItemLocation if ItemInformation not exist', async () => {
        delete testDataListingItemTemplate.itemInformation;
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);

        createdTemplateId = addListingItemTempRes.id;
        testData[1] = createdTemplateId;
        // Add Item Location
        const addDataRes: any = await testUtil.rpc(itemLocationCommand, testData);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe(`ItemInformation with the listingItemTemplateId=${testData[1]} was not found!`);
    });
});
