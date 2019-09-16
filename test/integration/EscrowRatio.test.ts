// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { EscrowRatioService } from '../../src/api/services/model/EscrowRatioService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { PaymentInformationService } from '../../src/api/services/model/PaymentInformationService';
import { EscrowService } from '../../src/api/services/model/EscrowService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { EscrowRatio } from '../../src/api/models/EscrowRatio';
import { EscrowRatioCreateRequest } from '../../src/api/requests/model/EscrowRatioCreateRequest';
import { EscrowRatioUpdateRequest } from '../../src/api/requests/model/EscrowRatioUpdateRequest';
import { MarketService } from '../../src/api/services/model/MarketService';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { EscrowCreateRequest } from '../../src/api/requests/model/EscrowCreateRequest';
import { EscrowType } from 'omp-lib/dist/interfaces/omp-enums';

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

    let market: resources.Market;
    let profile: resources.Profile;

    let listingItemTemplate: resources.ListingItemTemplate;
    let escrow: resources.Escrow;
    let escrowRatio: resources.EscrowRatio;

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
        escrowRatioService = app.IoC.getNamed<EscrowRatioService>(Types.Service, Targets.Service.model.EscrowRatioService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.model.PaymentInformationService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.model.EscrowService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

        // generate ListingItemTemplate without Escrow
        const templateGenerateParams = new GenerateListingItemTemplateParams([
            true,       // generateItemInformation
            true,       // generateItemLocation
            false,      // generateShippingDestinations
            false,      // generateItemImages
            true,       // generatePaymentInformation
            false,      // generateEscrow
            false,      // generateItemPrice
            true,       // generateMessagingInformation
            false,      // generateListingItemObjects
            false,      // generateObjectDatas
            profile.id, // profileId
            false,      // generateListingItem
            market.id   // marketId
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
            type: EscrowType.MAD,
            secondsToLock: 0
        } as EscrowCreateRequest;

        escrow = await escrowService.create(escrowData).then(value => value.toJSON());

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
        testData['escrow_id'] = escrow.id;
        const escrowRatioModel: EscrowRatio = await escrowRatioService.create(testData);
        escrowRatio = escrowRatioModel.toJSON();
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
        const escrowRatioModel: EscrowRatio = await escrowRatioService.findOne(escrowRatio.id);
        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should throw ValidationException because there is no escrow_id', async () => {
        expect.assertions(1);
        await escrowRatioService.update(escrowRatio.id, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the EscrowRatio', async () => {
        testDataUpdated['escrow_id'] = escrow.id;
        const escrowRatioModel: EscrowRatio = await escrowRatioService.update(escrowRatio.id, testDataUpdated);
        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testDataUpdated.buyer);
        expect(result.seller).toBe(testDataUpdated.seller);
    });

    test('Should delete the EscrowRatio', async () => {
        expect.assertions(4);
        await escrowRatioService.destroy(escrowRatio.id);

        await escrowRatioService.findOne(escrowRatio.id).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowRatio.id))
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
        await escrowService.findOne(escrow.id).catch(e =>
            expect(e).toEqual(new NotFoundException(escrow.id))
        );
    });

});
