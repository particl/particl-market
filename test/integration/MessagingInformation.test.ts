// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { MessagingInformationService } from '../../src/api/services/MessagingInformationService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { MessagingInformation } from '../../src/api/models/MessagingInformation';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { MessagingInformationCreateRequest } from '../../src/api/requests/MessagingInformationCreateRequest';
import { MessagingInformationUpdateRequest } from '../../src/api/requests/MessagingInformationUpdateRequest';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import * as resources from 'resources';

describe('MessagingInformation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messagingInformationService: MessagingInformationService;
    let listingItemTemplateService: ListingItemTemplateService;
    let profileService: ProfileService;

    let createdId;
    let createdListingItemTemplate: resources.ListingItemTemplate;
    let createdListingItem: resources.ListingItem;
    let defaultProfile;


    const testData = {
        listing_item_template_id: null,
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey1'
    } as MessagingInformationCreateRequest;

    const testData2 = {
        listing_item_id: null,
        protocol: 'SMSG',
        publicKey: 'bf4f3a68-b0a0-4202-b62a-ded47ca2cdae'
    } as MessagingInformationCreateRequest;

    const testDataUpdated = {
        listing_item_template_id: null,
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey2'
    } as MessagingInformationUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messagingInformationService = app.IoC.getNamed<MessagingInformationService>(Types.Service, Targets.Service.MessagingInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault();

        let generateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            false,  // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams
        } as TestDataGenerateRequest);
        createdListingItemTemplate = listingItemTemplates[0];

        generateParams = new GenerateListingItemParams([
            false,   // generateItemInformation
            false,   // generateItemLocation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();
        const listingItems = await testDataService.generate({
            model: CreatableModel.LISTINGITEM,  // what to generate
            amount: 1,                          // how many to generate
            withRelated: true,                  // return model
            generateParams                      // what kind of data to generate
        } as TestDataGenerateRequest);
        createdListingItem = listingItems[0];

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await messagingInformationService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new MessagingInformation for ListingItemTemplate', async () => {
        testData.listing_item_template_id = createdListingItemTemplate.id;
        const messagingInformationModel: MessagingInformation = await messagingInformationService.create(testData);
        createdId = messagingInformationModel.Id;

        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should create a new MessagingInformation for ListingItem', async () => {
        testData.listing_item_id = createdListingItem.id;
        const messagingInformationModel: MessagingInformation = await messagingInformationService.create(testData);
        createdId = messagingInformationModel.Id;

        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should throw ValidationException because we want to create a empty MessagingInformation', async () => {
        expect.assertions(1);
        await messagingInformationService.create({} as MessagingInformationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list MessagingInformations with our newly created ones', async () => {
        const messagingInformationCollection = await messagingInformationService.findAll();
        const messagingInformation = messagingInformationCollection.toJSON();
        expect(messagingInformation.length).toBe(2);

        const result = messagingInformation[0];

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should return one MessagingInformation', async () => {
        const messagingInformationModel: MessagingInformation = await messagingInformationService.findOne(createdId);
        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await messagingInformationService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the MessagingInformation', async () => {
        testDataUpdated.listing_item_template_id = createdListingItemTemplate.id;
        const messagingInformationModel: MessagingInformation = await messagingInformationService.update(createdId, testDataUpdated);
        const result = messagingInformationModel.toJSON();

        expect(result.protocol).toBe(testDataUpdated.protocol);
        expect(result.publicKey).toBe(testDataUpdated.publicKey);
    });

    test('Should delete the MessagingInformation', async () => {
        expect.assertions(2);
        await messagingInformationService.destroy(createdId);
        await messagingInformationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // delete listing-item-template
        await listingItemTemplateService.destroy(createdListingItemTemplate.id);
        await listingItemTemplateService.findOne(createdListingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemTemplate.id))
        );
    });

});
