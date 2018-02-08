import { app } from '../../src/app';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { PaymentInformationService } from '../../src/api/services/PaymentInformationService';
import { EscrowService } from '../../src/api/services/EscrowService';
import { ItemPriceService } from '../../src/api/services/ItemPriceService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { PaymentInformation } from '../../src/api/models/PaymentInformation';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';

import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';

import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { PaymentInformationCreateRequest } from '../../src/api/requests/PaymentInformationCreateRequest';
import { PaymentInformationUpdateRequest } from '../../src/api/requests/PaymentInformationUpdateRequest';

describe('PaymentInformation', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let paymentInformationService: PaymentInformationService;
    let profileService: ProfileService;
    let listingItemTemplateService: ListingItemTemplateService;
    let escrowService: EscrowService;
    let itemPriceService: ItemPriceService;

    let createdId;
    let createdListingItemTemplate;
    let defaultProfile;
    let escrowId;
    let itemPriceId;

    const testData = {
        listing_item_template_id: 0,
        type: PaymentType.SALE,
        escrow: {
            type: EscrowType.MAD,
            ratio: {
                buyer: 100,
                seller: 100
            }
        },
        itemPrice: {
            currency: Currency.BITCOIN,
            basePrice: 0.0001
        }
    } as PaymentInformationCreateRequest;

    const testDataUpdated = {
        listing_item_template_id: 0,
        type: PaymentType.FREE,
        escrow: {
            type: EscrowType.NOP,
            ratio: {
                buyer: 0,
                seller: 0
            }
        },
        itemPrice: {
            currency: Currency.PARTICL,
            basePrice: 0.002
        }
    } as PaymentInformationUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.PaymentInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.EscrowService);
        itemPriceService = app.IoC.getNamed<ItemPriceService>(Types.Service, Targets.Service.ItemPriceService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault();
        createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: 'listingitemtemplate',
            data: {
                profile_id: defaultProfile.Id,
                hash: 'itemhash'
            },
            withRelated: true
        } as TestDataCreateRequest);
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await paymentInformationService.create({
            type: PaymentType.SALE
        } as PaymentInformationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
            );
    });

    test('Should create a new payment information', async () => {
        testData.listing_item_template_id = createdListingItemTemplate.Id;

        const paymentInformationModel: PaymentInformation = await paymentInformationService.create(testData);
        createdId = paymentInformationModel.Id;
        const result = paymentInformationModel.toJSON();
        escrowId = result.Escrow.id;
        itemPriceId = result.ItemPrice.id;

        expect(result.type).toBe(testData.type);
        expect(result.Escrow.type).toBe(testData.escrow.type);
        expect(result.Escrow.Ratio.buyer).toBe(testData.escrow.ratio.buyer);
        expect(result.Escrow.Ratio.seller).toBe(testData.escrow.ratio.seller);
        expect(result.ItemPrice.currency).toBe(testData.itemPrice.currency);
        expect(result.ItemPrice.basePrice).toBe(testData.itemPrice.basePrice);
    });

    test('Should throw ValidationException because we want to create a empty payment information', async () => {
        expect.assertions(1);
        await paymentInformationService.create({} as PaymentInformationCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list payment informations with our new create one', async () => {
        const paymentInformationCollection = await paymentInformationService.findAll();
        const paymentInformation = paymentInformationCollection.toJSON();
        expect(paymentInformation.length).toBe(1);

        const result = paymentInformation[0];
        expect(result.type).toBe(testData.type); // findall doesnt return relations by default
    });

    test('Should return one payment information', async () => {
        const paymentInformationModel: PaymentInformation = await paymentInformationService.findOne(createdId);
        const result = paymentInformationModel.toJSON();

        expect(result.type).toBe(testData.type);
        expect(result.Escrow.type).toBe(testData.escrow.type);
        expect(result.Escrow.Ratio.buyer).toBe(testData.escrow.ratio.buyer);
        expect(result.Escrow.Ratio.seller).toBe(testData.escrow.ratio.seller);
        expect(result.ItemPrice.currency).toBe(testData.itemPrice.currency);
        expect(result.ItemPrice.basePrice).toBe(testData.itemPrice.basePrice);
    });

    test('Should throw ValidationException because there is no listing_item_id or listing_item_template_id', async () => {
        expect.assertions(1);
        await paymentInformationService.update(createdId, {
            type: PaymentType.SALE
        } as PaymentInformationUpdateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
            );
    });

    test('Should update the payment information', async () => {
        testDataUpdated.listing_item_template_id = 0;
        const paymentInformationModel: PaymentInformation = await paymentInformationService.update(createdId, testDataUpdated);
        const result = paymentInformationModel.toJSON();

        expect(result.type).toBe(testDataUpdated.type);
        expect(result.Escrow.type).toBe(testDataUpdated.escrow.type);
        expect(result.Escrow.Ratio.buyer).toBe(testDataUpdated.escrow.ratio.buyer);
        expect(result.Escrow.Ratio.seller).toBe(testDataUpdated.escrow.ratio.seller);
        expect(result.ItemPrice.currency).toBe(testDataUpdated.itemPrice.currency);
        expect(result.ItemPrice.basePrice).toBe(testDataUpdated.itemPrice.basePrice);
    });

    test('Should delete the payment information', async () => {
        expect.assertions(4);
        await paymentInformationService.destroy(createdId);
        await paymentInformationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // delete listing-item-template
        await listingItemTemplateService.destroy(createdListingItemTemplate.id);
        await listingItemTemplateService.findOne(createdListingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemTemplate.id))
        );
        // findout escrow
        await escrowService.findOne(escrowId).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );
        // findout itemPrice
        await itemPriceService.findOne(itemPriceId).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );
    });

});
