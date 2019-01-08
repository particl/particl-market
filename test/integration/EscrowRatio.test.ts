// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { EscrowRatioService } from '../../src/api/services/EscrowRatioService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { PaymentInformationService } from '../../src/api/services/PaymentInformationService';
import { EscrowService } from '../../src/api/services/EscrowService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { EscrowRatio } from '../../src/api/models/EscrowRatio';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowRatioCreateRequest } from '../../src/api/requests/EscrowRatioCreateRequest';
import { EscrowRatioUpdateRequest } from '../../src/api/requests/EscrowRatioUpdateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import {MarketService} from '../../src/api/services/MarketService';
import {GenerateListingItemTemplateParams} from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import {CreatableModel} from '../../src/api/enums/CreatableModel';
import {TestDataGenerateRequest} from '../../src/api/requests/TestDataGenerateRequest';
import * as resources from "resources";
import {Escrow} from '../../src/api/models/Escrow';
import {EscrowCreateRequest} from '../../src/api/requests/EscrowCreateRequest';

describe('EscrowRatio', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let escrowRatioService: EscrowRatioService;
    let marketService: MarketService;
    let profileService: ProfileService;
    let listingItemTemplateService: ListingItemTemplateService;
    let paymentInformationService: PaymentInformationService;
    let escrowService: EscrowService;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let listingItemTemplate: resources.ListingItemTemplate;
    let createdEscrow: resources.Escrow;
    let createdEscrowRatio: resources.EscrowRatio;

    const testData = {
        buyer: 50,
        seller: 50
    } as EscrowRatioCreateRequest;

    const testDataUpdated = {
        buyer: 100,
        seller: 100
    } as EscrowRatioUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        escrowRatioService = app.IoC.getNamed<EscrowRatioService>(Types.Service, Targets.Service.EscrowRatioService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.PaymentInformationService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.EscrowService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        // get default profile
        const defaultProfileModel = await profileService.getDefault();
        defaultProfile = defaultProfileModel.toJSON();

        // get default market
        const defaultMarketModel = await marketService.getDefault();
        defaultMarket = defaultMarketModel.toJSON();

        // generate ListingItemTemplate without Escrow
        const templateGenerateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            false,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            false,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        // log.debug('templateGenerateParams:', JSON.stringify(templateGenerateParams, null, 2));

        const listingItemTemplates = await testDataService.generate({
            model: CreatableModel.LISTINGITEMTEMPLATE,
            amount: 1,
            withRelated: true,
            generateParams: templateGenerateParams
        } as TestDataGenerateRequest);
        listingItemTemplate = listingItemTemplates[0];

        // create Escrow without EscrowRatio
        const escrowData = {
            payment_information_id: listingItemTemplate.PaymentInformation.id,
            type: EscrowType.MAD
        } as EscrowCreateRequest;

        const escrowModel: Escrow = await escrowService.create(escrowData);
        createdEscrow = escrowModel.toJSON();

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no escrow_id', async () => {
        expect.assertions(1);
        await escrowRatioService.create({
            buyer: 50,
            seller: 50
        } as EscrowRatioCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new EscrowRatio', async () => {
        testData['escrow_id'] = createdEscrow.id;
        const escrowRatioModel: EscrowRatio = await escrowRatioService.create(testData);
        createdEscrowRatio = escrowRatioModel.toJSON();
        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should throw ValidationException because we want to create a empty EscrowRatio', async () => {
        expect.assertions(1);
        await escrowRatioService.create({} as EscrowRatioCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list EscrowRatios with our new create one', async () => {
        const escrowRatioCollection = await escrowRatioService.findAll();
        const escrowRatio = escrowRatioCollection.toJSON();
        expect(escrowRatio.length).toBe(1);

        const result = escrowRatio[0];
        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should return one EscrowRatio', async () => {
        const escrowRatioModel: EscrowRatio = await escrowRatioService.findOne(createdEscrowRatio.id);
        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should throw ValidationException because there is no escrow_id', async () => {
        expect.assertions(1);
        await escrowRatioService.update(createdEscrowRatio.id, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the EscrowRatio', async () => {
        testDataUpdated['escrow_id'] = createdEscrow.id;
        const escrowRatioModel: EscrowRatio = await escrowRatioService.update(createdEscrowRatio.id, testDataUpdated);
        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testDataUpdated.buyer);
        expect(result.seller).toBe(testDataUpdated.seller);
    });

    test('Should delete the EscrowRatio', async () => {
        expect.assertions(4);
        await escrowRatioService.destroy(createdEscrowRatio.id);

        await escrowRatioService.findOne(createdEscrowRatio.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdEscrowRatio.id))
        );

        // delete ListingItemTemplate
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await listingItemTemplateService.findOne(listingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemTemplate.id))
        );

        // PaymentInformation should have been removed too
        await paymentInformationService.findOne(listingItemTemplate.PaymentInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemTemplate.PaymentInformation.id))
        );

        // same with Escrow
        await escrowService.findOne(createdEscrow.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdEscrow.id))
        );
    });

});
