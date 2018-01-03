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
import { ListingItemService } from '../../src/api/services/ListingItemService';

describe('Escrow', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let escrowService: EscrowService;
    let profileService: ProfileService;
    let listingItemTemplateService: ListingItemTemplateService;
    let paymentInformationService: PaymentInformationService;

    let createdId;
    let paymentInformationId;
    let listingItemTemplateId;

    const testData = {
        type: EscrowType.MAD,
        ratio: {
            buyer: 50,
            seller: 50
        },
        payment_information_id: 0
    };

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
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.PaymentInformationService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
        const defaultProfile = await profileService.getDefault();
        // create payment-information
        const createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: 'listingitemtemplate',
            data: {
                profile_id: defaultProfile.Id,
                hash: 'itemhash',
                paymentInformation: {
                    type: PaymentType.SALE
                }
            } as any,
            withRelated: true
        } as TestDataCreateRequest);
        listingItemTemplateId = createdListingItemTemplate.toJSON().id;
        paymentInformationId = createdListingItemTemplate.toJSON().PaymentInformation.id;
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
        } as any).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
            );
    });

    test('Should create a new escrow', async () => {
        testData['payment_information_id'] = paymentInformationId;
        const escrowModel: Escrow = await escrowService.create(testData as EscrowCreateRequest);
        createdId = escrowModel.Id;

        const result = escrowModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);

    });

    test('Should throw ValidationException because we want to create a empty escrow', async () => {
        expect.assertions(1);
        await escrowService.create({} as any).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list escrows with our new create one', async () => {
        const escrowCollection = await escrowService.findAll();
        const escrow = escrowCollection.toJSON();
        expect(escrow.length).toBe(1);

        const result = escrow[0];

        expect(result.type).toBe(testData.type);
        expect(result.Ratio).toBe(undefined); // doesnt fetch related
    });

    test('Should return one escrow', async () => {
        const escrowModel: Escrow = await escrowService.findOne(createdId);
        const result = escrowModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.Ratio.buyer).toBe(testData.ratio.buyer);
        expect(result.Ratio.seller).toBe(testData.ratio.seller);
    });

    test('Should throw ValidationException because there is no payment_information_id', async () => {
        expect.assertions(1);
        await escrowService.update(createdId, {
            type: EscrowType.NOP,
            ratio: {
                buyer: 100,
                seller: 100
            }
        } as any).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
            );
    });

    test('Should update the escrow', async () => {
        testDataUpdated['payment_information_id'] = paymentInformationId;
        const escrowModel: Escrow = await escrowService.update(createdId, testDataUpdated);
        const result = escrowModel.toJSON();

        expect(result.type).toBe(testDataUpdated.type);
        expect(result.Ratio.buyer).toBe(testDataUpdated.ratio.buyer);
        expect(result.Ratio.seller).toBe(testDataUpdated.ratio.seller);
    });

    test('Should delete the escrow', async () => {
        expect.assertions(3);
        // delete escrow
        await escrowService.destroy(createdId);
        await escrowService.findOne(createdId).catch(e =>
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
    });

});
