// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../../src/api/exceptions/ModelNotFoundException';

describe('ListingItemTemplateRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateRemoveCommand = Commands.TEMPLATE_REMOVE.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;
    let listingItemTemplate: resources.ListingItemTemplate;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // get default profile and market
        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

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

    test('Should fail to remove ListingItemTemplate because of missing listingItemTemplateId', async () => {
        const res: any = await testUtil.rpc(templateCommand, [templateRemoveCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('listingItemTemplateId').getMessage());
    });

    test('Should fail to remove ListingItemTemplate because of invalid listingItemTemplateId', async () => {
        const fakeId = 'not a number';
        const res: any = await testUtil.rpc(templateCommand, [templateRemoveCommand, fakeId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('listingItemTemplateId', 'number').getMessage());
    });

    test('Should fail to remove ListingItemTemplate because of a non-existent listingItemTemplate', async () => {
        const fakeId = 1000000000;
        const res: any = await testUtil.rpc(templateCommand, [templateRemoveCommand, fakeId]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });

    test('Should fail to remove ListingItemTemplate because ListingItemTemplate has related ListingItems', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        // generate ListingItemTemplate with ListingItem
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];
        listingItemTemplate = listingItemTemplates[0];

        // expect template is related to correct profile and ListingItem posted to correct Market
        expect(listingItemTemplate.Profile.id).toBe(defaultProfile.id);
        expect(listingItemTemplate.ListingItems[0].Market.id).toBe(defaultMarket.id);

        // TODO: expect template hash created on the server matches what we create here
        // todo generate hash
        // expect(listingItemTemplate.hash).toBe(generatedTemplateHash);

        // expect the item hash generated at the same time as template, matches with the templates one
        log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        log.debug('listingItemTemplate.ListingItems[0].hash:', listingItemTemplate.ListingItems[0].hash);
        expect(listingItemTemplate.hash).toBe(listingItemTemplate.ListingItems[0].hash);

        // remove Listing item template
        const result: any = await testUtil.rpc(templateCommand, [templateRemoveCommand, listingItemTemplate.id]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe(`ListingItemTemplate has ListingItems, so it can't be deleted. id=${listingItemTemplate.id}`);
    });

    test('Should remove ListingItemTemplate', async () => {
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false   // generateObjectDatas
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];
        listingItemTemplate = listingItemTemplates[0];

        const result: any = await testUtil.rpc(templateCommand, [templateRemoveCommand, listingItemTemplate.id]);
        result.expectJson();
        result.expectStatusCode(200);

        // TODO: check that all the related models are deleted too
    });

    test('Should fail remove ListingItemTemplate because ListingItemTemplate already removed', async () => {
        // remove Listing item template
        const result: any = await testUtil.rpc(templateCommand, [templateRemoveCommand, listingItemTemplate.id]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.success).toBe(false);
        expect(result.error.error.message).toBe(new ModelNotFoundException('ListingItemTemplate').getMessage());
    });


});
