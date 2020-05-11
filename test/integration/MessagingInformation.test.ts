// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { MessagingInformationService } from '../../src/api/services/model/MessagingInformationService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { MessagingInformationCreateRequest } from '../../src/api/requests/model/MessagingInformationCreateRequest';
import { MessagingInformationUpdateRequest } from '../../src/api/requests/model/MessagingInformationUpdateRequest';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { MessagingProtocol } from 'omp-lib/dist/interfaces/omp-enums';
import { MarketService } from '../../src/api/services/model/MarketService';

describe('MessagingInformation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let messagingInformationService: MessagingInformationService;
    let listingItemTemplateService: ListingItemTemplateService;
    let profileService: ProfileService;
    let marketService: MarketService;

    let profile: resources.Profile;
    let market: resources.Market;

    let listingItemTemplate: resources.ListingItemTemplate;

    let messagingInformationForListingItem: resources.MessagingInformation;
    let messagingInformationForTemplate: resources.MessagingInformation;

    const testData = {
        protocol: MessagingProtocol.SMSG,
        publicKey: 'publickey1'
    } as MessagingInformationCreateRequest;

    const testDataUpdated = {
        protocol: MessagingProtocol.SMSG,
        publicKey: 'publickey2'
    } as MessagingInformationUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        messagingInformationService = app.IoC.getNamed<MessagingInformationService>(Types.Service, Targets.Service.model.MessagingInformationService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        const generateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            false,      // generateShippingDestinations
            false,      // generateItemImages
            false,      // generatePaymentInformation
            false,      // generateEscrow
            false,      // generateItemPrice
            false,      // generateMessagingInformation
            false,      // generateListingItemObjects
            false,      // generateObjectDatas
            profile.id, // profileId
            true,       // generateListingItem
            market.id   // marketId
        ]).toParamsArray();
        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams
        } as TestDataGenerateRequest);
        listingItemTemplate = listingItemTemplates[0];
    });

    afterAll(async () => {
        //
    });

    test('Should create a new MessagingInformation for ListingItemTemplate', async () => {
        testData.listing_item_template_id = listingItemTemplate.id;

        messagingInformationForTemplate = await messagingInformationService.create(testData).then(value => value.toJSON());
        const result = messagingInformationForTemplate;

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should create a new MessagingInformation for ListingItem', async () => {
        testData.listing_item_id = listingItemTemplate.ListingItems[0].id;

        messagingInformationForListingItem = await messagingInformationService.create(testData).then(value => value.toJSON());
        const result = messagingInformationForListingItem;

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
        const messagingInformations: resources.MessagingInformation[] = await messagingInformationService.findAll().then(value => value.toJSON());
        expect(messagingInformations.length).toBe(2);

        const result: resources.MessagingInformation = messagingInformations[0];

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should return one MessagingInformation', async () => {
        const result: resources.MessagingInformation = await messagingInformationService.findOne(messagingInformationForListingItem.id)
            .then(value => value.toJSON());

        expect(result.protocol).toBe(testData.protocol);
        expect(result.publicKey).toBe(testData.publicKey);
    });

    test('Should update the MessagingInformation', async () => {
        const result: resources.MessagingInformation = await messagingInformationService.update(messagingInformationForTemplate.id, testDataUpdated)
            .then(value => value.toJSON());

        expect(result.protocol).toBe(testDataUpdated.protocol);
        expect(result.publicKey).toBe(testDataUpdated.publicKey);
    });

    test('Should delete the MessagingInformation', async () => {
        expect.assertions(1);
        await messagingInformationService.destroy(messagingInformationForTemplate.id);
        await messagingInformationService.findOne(messagingInformationForTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(messagingInformationForTemplate.id))
        );
    });

});
