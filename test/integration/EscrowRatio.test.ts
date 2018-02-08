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
import { PaymentInformation } from '../../src/api/models/PaymentInformation';

describe('EscrowRatio', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let escrowRatioService: EscrowRatioService;
    let profileService: ProfileService;
    let listingItemTemplateService: ListingItemTemplateService;
    let paymentInformationService: PaymentInformationService;
    let escrowService: EscrowService;

    let createdId;
    let listingItemTemplateId;
    let paymentInformationId;
    let escrowId;

    const testData = {
        buyer: 50,
        seller: 50,
        escrow_id: 0
    } as EscrowRatioCreateRequest;

    const testDataUpdated = {
        buyer: 100,
        seller: 100,
        escrow_id: 0
    } as EscrowRatioUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        escrowRatioService = app.IoC.getNamed<EscrowRatioService>(Types.Service, Targets.Service.EscrowRatioService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.PaymentInformationService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.EscrowService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();
        const defaultProfile = await profileService.getDefault();
        // create payment-information
        const createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: 'listingitemtemplate',
            data: {
                profile_id: defaultProfile.Id,
                hash: 'itemhash',
                paymentInformation: {
                    type: PaymentType.SALE,
                    escrow: {
                        type: EscrowType.MAD,
                        ratio: {
                            buyer: 120,
                            seller: 300
                        }
                    }
                }
            } as any,
            withRelated: true
        } as TestDataCreateRequest);
        listingItemTemplateId = createdListingItemTemplate.toJSON().id;
        paymentInformationId = createdListingItemTemplate.toJSON().PaymentInformation.id;
        escrowId = createdListingItemTemplate.toJSON().PaymentInformation.Escrow.id;
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

    test('Should create a new escrow ratio', async () => {
        testData['escrow_id'] = escrowId;
        const escrowRatioModel: EscrowRatio = await escrowRatioService.create(testData);
        createdId = escrowRatioModel.Id;

        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should throw ValidationException because we want to create a empty escrow ratio', async () => {
        expect.assertions(1);
        await escrowRatioService.create({} as EscrowRatioCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list escrow ratios with our new create one', async () => {
        const escrowRatioCollection = await escrowRatioService.findAll();
        const escrowRatio = escrowRatioCollection.toJSON();
        expect(escrowRatio.length).toBe(2); // including existing

        const result = escrowRatio[1];

        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should return one escrow ratio', async () => {
        const escrowRatioModel: EscrowRatio = await escrowRatioService.findOne(createdId);
        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testData.buyer);
        expect(result.seller).toBe(testData.seller);
    });

    test('Should throw ValidationException because there is no escrow_id', async () => {
        expect.assertions(1);
        await escrowRatioService.update(createdId, {
            buyer: 100,
            seller: 100
        } as EscrowRatioUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
            );
    });

    test('Should update the escrow ratio', async () => {
        testDataUpdated['escrow_id'] = escrowId;
        const escrowRatioModel: EscrowRatio = await escrowRatioService.update(createdId, testDataUpdated);
        const result = escrowRatioModel.toJSON();

        expect(result.buyer).toBe(testDataUpdated.buyer);
        expect(result.seller).toBe(testDataUpdated.seller);
    });

    test('Should delete the escrow ratio', async () => {
        expect.assertions(4);
        await escrowRatioService.destroy(createdId);
        await escrowRatioService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // delete listing-item-template
        await listingItemTemplateService.destroy(listingItemTemplateId);
        await listingItemTemplateService.findOne(listingItemTemplateId).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemTemplateId))
        );

        // findout payment-information
        await paymentInformationService.findOne(paymentInformationId).catch(e =>
            expect(e).toEqual(new NotFoundException(paymentInformationId))
        );
        // findout escrow
        await escrowService.findOne(escrowId).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );
    });

});
