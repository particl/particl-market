// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ItemLocationRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const itemLocationCommand = Commands.ITEMLOCATION_ROOT.commandName;
    const itemLocationRemoveCommand = Commands.ITEMLOCATION_REMOVE.commandName;

    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // profile & market
        const defaultProfile: resources.Profile = await testUtil.getDefaultProfile();
        const defaultMarket: resources.Market = await testUtil.getDefaultMarket();

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,  // generateListingItem
            defaultMarket.id   // marketId
        ]).toParamsArray();

        const listingItemTemplates: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        listingItemTemplate = listingItemTemplates[0];
    });

    test('Should fail to remove ItemLocation because of missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to remove ItemLocation because of invalid listingItemTemplateId', async () => {
        const fakeId = 'not a number';
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand, fakeId]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail to remove ItemLocation because of a non-existent listingItemTemplate', async () => {
        const fakeId = 1000000000;
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand, fakeId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });

    test('Should fail to remove ItemLocation because it doesnt exist', async () => {
        const defaultProfile: resources.Profile = await testUtil.getDefaultProfile();
        const defaultMarket: resources.Market = await testUtil.getDefaultMarket();

        // create ListingItemTemplate
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            false,   // generateItemInformation
            false,   // generateItemLocation
            false,   // generateShippingDestinations
            false,  // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,  // generateListingItem
            defaultMarket.id   // marketId
        ]).toParamsArray();

        const templatesWithoutItemInformation: resources.ListingItemTemplate[] = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE,
            1,
            true,
            generateListingItemTemplateParams
        );
        const template = templatesWithoutItemInformation[0];

        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand, template.id]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ItemLocation').getMessage());
    });

    test('Should remove ItemLocation', async () => {
        const res: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand, listingItemTemplate.id]);
        res.expectJson();
        res.expectStatusCode(200);
    });

    test('Should fail to remove ItemLocation because its already removed', async () => {
        const addDataRes: any = await testUtil.rpc(itemLocationCommand, [itemLocationRemoveCommand, listingItemTemplate.id]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(404);
    });

});
