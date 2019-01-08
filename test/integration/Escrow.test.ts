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
import { EscrowService } from '../../src/api/services/EscrowService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { PaymentInformationService } from '../../src/api/services/PaymentInformationService';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { Escrow } from '../../src/api/models/Escrow';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowCreateRequest } from '../../src/api/requests/EscrowCreateRequest';
import { EscrowUpdateRequest } from '../../src/api/requests/EscrowUpdateRequest';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import {GenerateListingItemTemplateParams} from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import {CreatableModel} from '../../src/api/enums/CreatableModel';
import {TestDataGenerateRequest} from '../../src/api/requests/TestDataGenerateRequest';
import * as resources from "resources";
import {MarketService} from '../../src/api/services/MarketService';

describe('Escrow', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let marketService: MarketService;
    let escrowService: EscrowService;
    let profileService: ProfileService;
    let listingItemTemplateService: ListingItemTemplateService;
    let paymentInformationService: PaymentInformationService;

    let defaultMarket: resources.Market;
    let defaultProfile: resources.Profile;
    let listingItemTemplate: resources.ListingItemTemplate;
    let createdEscrow: resources.Escrow;

    const testData = {
        type: EscrowType.MAD,
        ratio: {
            buyer: 50,
            seller: 50
        },
        payment_information_id: 0
    } as EscrowCreateRequest;

    const testDataUpdated = {
        type: EscrowType.NOP,
        ratio: {
            buyer: 100,
            seller: 100
        },
        payment_information_id: 0
    } as EscrowUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.EscrowService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.PaymentInformationService);

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

    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no payment_information_id', async () => {
        expect.assertions(1);
        await escrowService.create({
            type: EscrowType.NOP,
            ratio: {
                buyer: 100,
                seller: 100
            }
        } as EscrowCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new Escrow', async () => {
        testData.payment_information_id = listingItemTemplate.PaymentInformation.id;
        const escrowModel: Escrow = await escrowService.create(testData as EscrowCreateRequest);
        createdEscrow = escrowModel.toJSON();
        const result = createdEscrow;

        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);

    });

    test('Should throw ValidationException because we want to create a empty Escrow', async () => {
        expect.assertions(1);
        await escrowService.create({} as EscrowCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list Escrows with our new create one', async () => {
        const escrowCollection = await escrowService.findAll();
        const escrow = escrowCollection.toJSON();
        expect(escrow.length).toBe(1);

        const result = escrow[0];

        expect(result.type).toBe(testData.type);
        expect(result.Ratio).toBe(undefined); // doesnt fetch related
    });

    test('Should return one Escrow', async () => {
        const escrowModel: Escrow = await escrowService.findOne(createdEscrow.id);
        const result = escrowModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);
    });

    test('Should throw ValidationException because there is no payment_information_id', async () => {
        expect.assertions(1);
        await escrowService.update(createdEscrow.id, {
            type: EscrowType.NOP,
            ratio: {
                buyer: 100,
                seller: 100
            }
        } as EscrowUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
            );
    });

    test('Should update the Escrow', async () => {
        testDataUpdated.payment_information_id = listingItemTemplate.PaymentInformation.id;
        const escrowModel: Escrow = await escrowService.update(createdEscrow.id, testDataUpdated);
        const result = escrowModel.toJSON();

        expect(result.type).toBe(testDataUpdated.type);
        expect(result.Ratio.buyer).toBe(testDataUpdated.ratio.buyer);
        expect(result.Ratio.seller).toBe(testDataUpdated.ratio.seller);
    });

    test('Should delete the Escrow', async () => {
        expect.assertions(3);

        // delete Escrow
        await escrowService.destroy(createdEscrow.id);
        await escrowService.findOne(createdEscrow.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdEscrow.id))
        );
        // delete listing-item-template
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await listingItemTemplateService.findOne(listingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemTemplate.id))
        );

        // PaymentInformation should have been removed too
        await paymentInformationService.findOne(listingItemTemplate.PaymentInformation.id).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemTemplate.PaymentInformation.id))
        );
    });

});
