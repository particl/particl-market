// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { Currency } from '../../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';

describe('ItemLocationRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ITEMLOCATION_ROOT.commandName;
    const subCommand = Commands.ITEMLOCATION_ADD.commandName;

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

    const testData = [subCommand, 0, 'CN', 'USA', 'TITLE', 'TEST DESCRIPTION', 25.7, 22.77];

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
        const addDataRes: any = await rpc(method, [subCommand]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe('Country code can\'t be blank.');
    });

    test('Should create ItemLocation', async () => {
        // Add Item Location
        testData[1] = createdTemplateId;
        const addDataRes: any = await rpc(method, testData);
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
        const addDataRes: any = await rpc(method, testData);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe(`ItemLocation with the listing template id=${testData[1]} is already exist`);
    });

    test('Should create ItemLocation if ItemInformation not exist', async () => {
        delete testDataListingItemTemplate.itemInformation;
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);

        createdTemplateId = addListingItemTempRes.id;
        testData[1] = createdTemplateId;
        // Add Item Location
        const addDataRes: any = await rpc(method, testData);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
        expect(addDataRes.error.error.success).toBe(false);
        expect(addDataRes.error.error.message).toBe(`ItemInformation with the listing template id=${testData[1]} was not found!`);
    });
});
