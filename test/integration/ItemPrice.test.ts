import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { PaymentInformationService } from '../../src/api/services/PaymentInformationService';
import { EscrowService } from '../../src/api/services/EscrowService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ItemPrice } from '../../src/api/models/ItemPrice';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';

import { ItemPriceService } from '../../src/api/services/ItemPriceService';
import { PaymentInformationCreateRequest } from '../../src/api/requests/PaymentInformationCreateRequest';
import { ItemPriceCreateRequest } from '../../src/api/requests/ItemPriceCreateRequest';
import { ItemPriceUpdateRequest } from '../../src/api/requests/ItemPriceUpdateRequest';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';
import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';

describe('ItemPrice', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemPriceService: ItemPriceService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;
    let paymentInformationService: PaymentInformationService;
    let escrowService: EscrowService;

    let createdId: number;
    let createdListingItemTemplate;
    let escrowId;
    let newcreatedId: number;

    let paymentInfoId;

    const testData = {
        payment_information_id: null,
        currency: Currency.BITCOIN,
        basePrice: 0.0001,
        shippingPrice: {
            domestic: 0.123,
            international: 1.234
        },
        cryptocurrencyAddress: {
            type: CryptocurrencyAddressType.NORMAL,
            address: '1234'
        }
    } as ItemPriceCreateRequest;

    const testDataUpdated = {
        currency: Currency.PARTICL,
        basePrice: 0.002,
        shippingPrice: {
            domestic: 1.234,
            international: 2.345
        },
        cryptocurrencyAddress: {
            type: CryptocurrencyAddressType.STEALTH,
            address: '4567'
        }
    } as ItemPriceUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemPriceService = app.IoC.getNamed<ItemPriceService>(Types.Service, Targets.Service.ItemPriceService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.PaymentInformationService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.EscrowService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

        const defaultProfile = await profileService.getDefault();
        createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: 'listingitemtemplate',
            data: {
                profile_id: defaultProfile.Id,
                hash: 'itemhash',
                paymentInformation: {
                    type: PaymentType.FREE,
                    escrow: {
                        type: EscrowType.MAD,
                        ratio: {
                            buyer: 1,
                            seller: 1
                        }
                    }
                }
            } as any,
            withRelated: true
        } as TestDataCreateRequest);
        paymentInfoId = createdListingItemTemplate.toJSON().PaymentInformation.id;
        escrowId = createdListingItemTemplate.toJSON().PaymentInformation.Escrow.id;
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no payment_information_id', async () => {
        expect.assertions(1);
        await itemPriceService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should throw ValidationException because there is no currency', async () => {
        expect.assertions(1);
        testData.payment_information_id = paymentInfoId;
        const currency = testData.currency;
        delete testData.currency;
        await itemPriceService.create(testData).catch(e => {
            testData.currency = currency;
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        }).then(res => {
            testData.currency = currency;
        });
    });

    test('Should throw ValidationException because there is no basePrice', async () => {
        expect.assertions(1);
        const basePrice = testData.basePrice;
        delete testData.basePrice;
        await itemPriceService.create(testData).catch(e => {
            testData.basePrice = basePrice;
            expect(e).toEqual(new ValidationException('Request body is not valid', []));
        }).then(res => {
            testData.basePrice = basePrice;
        });
    });

    test('Should create a new item price', async () => {
        testData.payment_information_id = paymentInfoId;

        const itemPriceModel: ItemPrice = await itemPriceService.create(testData);
        createdId = itemPriceModel.Id;

        const result = itemPriceModel.toJSON();

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testData.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testData.shippingPrice.international);
        expect(result.CryptocurrencyAddress.type).toBe(testData.cryptocurrencyAddress.type);
        expect(result.CryptocurrencyAddress.address).toBe(testData.cryptocurrencyAddress.address);
    });

    test('Should throw ValidationException because we want to create a empty item price', async () => {
        expect.assertions(1);
        await itemPriceService.create({} as ItemPriceCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list item prices with our new create one', async () => {
        const itemPriceCollection = await itemPriceService.findAll();
        const itemPrice = itemPriceCollection.toJSON();
        expect(itemPrice.length).toBe(1);

        const result = itemPrice[0];

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.ShippingPrice).toBe(undefined); // doesnt fetch related
        expect(result.CryptocurrencyAddress).toBe(undefined); // doesnt fetch related
    });

    test('Should return one item price', async () => {
        const itemPriceModel: ItemPrice = await itemPriceService.findOne(createdId);
        const result = itemPriceModel.toJSON();

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testData.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testData.shippingPrice.international);
        expect(result.CryptocurrencyAddress.type).toBe(testData.cryptocurrencyAddress.type);
        expect(result.CryptocurrencyAddress.address).toBe(testData.cryptocurrencyAddress.address);
    });

    test('Should throw ValidationException because there is no payment_information_id', async () => {
        expect.assertions(1);
        await itemPriceService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the item price', async () => {
        testDataUpdated.payment_information_id = paymentInfoId;

        const itemPriceModel: ItemPrice = await itemPriceService.update(createdId, testDataUpdated);
        const result = itemPriceModel.toJSON();

        expect(result.currency).toBe(testDataUpdated.currency);
        expect(result.basePrice).toBe(testDataUpdated.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testDataUpdated.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testDataUpdated.shippingPrice.international);
        expect(result.CryptocurrencyAddress.type).toBe(testDataUpdated.cryptocurrencyAddress.type);
        expect(result.CryptocurrencyAddress.address).toBe(testDataUpdated.cryptocurrencyAddress.address);
    });

    test('Should create a new item price missing shipping price', async () => {
        const shippingPrice = testData.shippingPrice;
        delete testData.shippingPrice;

        const itemPriceModel: ItemPrice = await itemPriceService.create(testData);
        newcreatedId = itemPriceModel.Id;

        testData.shippingPrice = shippingPrice;

        const result = itemPriceModel.toJSON();

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.CryptocurrencyAddress.type).toBe(testData.cryptocurrencyAddress.type);
        expect(result.CryptocurrencyAddress.address).toBe(testData.cryptocurrencyAddress.address);

        await itemPriceService.destroy(newcreatedId);
        await itemPriceService.findOne(newcreatedId).catch(e =>
            expect(e).toEqual(new NotFoundException(newcreatedId))
        );
    });

    test('Should create a new item price missing cryptocurrency address', async () => {
        const cryptocurrencyAddress = testData.cryptocurrencyAddress;
        delete testData.cryptocurrencyAddress;

        const itemPriceModel: ItemPrice = await itemPriceService.create(testData);
        newcreatedId = itemPriceModel.Id;

        testData.cryptocurrencyAddress = cryptocurrencyAddress;

        const result = itemPriceModel.toJSON();

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);
        expect(result.ShippingPrice.domestic).toBe(testData.shippingPrice.domestic);
        expect(result.ShippingPrice.international).toBe(testData.shippingPrice.international);

        await itemPriceService.destroy(newcreatedId);
        await itemPriceService.findOne(newcreatedId).catch(e =>
            expect(e).toEqual(new NotFoundException(newcreatedId))
        );
    });

    test('Should create a new item price missing shipping price and cryptocurrency address', async () => {
        const cryptocurrencyAddress = testData.cryptocurrencyAddress;
        delete testData.cryptocurrencyAddress;

        const shippingPrice = testData.shippingPrice;
        delete testData.shippingPrice;

        const itemPriceModel: ItemPrice = await itemPriceService.create(testData);
        newcreatedId = itemPriceModel.Id;

        testData.cryptocurrencyAddress = cryptocurrencyAddress;
        testData.shippingPrice = shippingPrice;

        const result = itemPriceModel.toJSON();

        expect(result.currency).toBe(testData.currency);
        expect(result.basePrice).toBe(testData.basePrice);

        await itemPriceService.destroy(newcreatedId);
        await itemPriceService.findOne(newcreatedId).catch(e =>
            expect(e).toEqual(new NotFoundException(newcreatedId))
        );
    });

    test('Should delete the item price', async () => {
        expect.assertions(4);
        await itemPriceService.destroy(createdId);
        await itemPriceService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        // delete listing-item-template
        await listingItemTemplateService.destroy(createdListingItemTemplate.id);
        await listingItemTemplateService.findOne(createdListingItemTemplate.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemTemplate.id))
        );

        // findout payment-information
        await paymentInformationService.findOne(paymentInfoId).catch(e =>
            expect(e).toEqual(new NotFoundException(paymentInfoId))
        );

        // findout Escrown
        await escrowService.findOne(escrowId).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );
    });
});
