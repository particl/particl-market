// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';

describe('ItemLocationRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationRemoveCommand = Commands.ITEMLOCATION_REMOVE.commandName;

    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates First',
            shortDescription: 'Item short description with Templates First',
            longDescription: 'Item long description with Templates First',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            listingItemId: null,
            itemLocation: {
                region: 'South Africa',
                address: 'asdf, asdf, asdf',
                locationMarker: {
                    markerTitle: 'Helsinki',
                    markerText: 'Helsinki',
                    lat: 12.1234,
                    lng: 23.2314
                }
            }
        }
    };
    const testDataListingItemTemplate2 = {
        profile_id: 0,
        itemInformation: {
            title: 'Title2',
            shortDescription: 'SDescription2',
            longDescription: 'LDescription2',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            listingItemId: null,
            itemLocation: {
                region: 'Australia',
                address: 'fdsa fdsa fdsa fdsa',
                locationMarker: {
                    markerTitle: 'Adelaide',
                    markerText: 'Adelaide',
                    lat: 34.9228,
                    lng: 138.6019
                }
            }
        }
    };

    let createdTemplateId;
    let createdlistingitemId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemParams = new GenerateListingItemParams([
            false,   // generateItemInformation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // get profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // create item template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        createdTemplateId = addListingItemTempRes.id;

        // create listing item
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                                  // how many to generate
            true,                               // return model
            generateListingItemParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        createdlistingitemId = listingItems[0].id;
    });

    test('Should remove ItemLocation', async () => {
        // remove item location
        const addDataRes: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand, createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
    });

    test('Should fail to remove ItemLocation because its already removed', async () => {
        // remove item location
        const addDataRes: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand, createdTemplateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });

    test('Should not remove ItemLocation because ItemInformation is related with ListingItem', async () => {
        // set listing item id in item information
        testDataListingItemTemplate.itemInformation.listingItemId = createdlistingitemId;

        testDataListingItemTemplate2.profile_id = testDataListingItemTemplate.profile_id;
        testDataListingItemTemplate2.itemInformation.listingItemId = createdlistingitemId;

        // create new item template
        const newListingItemTemplate = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate2);

        // remove item location
        const addDataRes: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand, newListingItemTemplate.id]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('ItemLocation cannot be removed because the ListingItem has allready been posted!');
    });

    test('Should fail to remove ItemLocation if ItemInformation not exist', async () => {
        // create new item template
        delete testDataListingItemTemplate.itemInformation;
        // const addListingItemTempRes = await testUtil.generateData(CreatableModel.LISTINGITEMTEMPLATE, 1, true);
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const templateId = addListingItemTempRes.id;
        // remove item location
        const addDataRes: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand, templateId]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('ItemInformation or ItemLocation with the listingItemTemplateId=' + templateId + ' was not found!');
    });

});
