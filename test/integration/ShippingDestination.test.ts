import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ShippingDestination } from '../../src/api/models/ShippingDestination';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { Country } from '../../src/api/enums/Country';

import { ShippingDestinationService } from '../../src/api/services/ShippingDestinationService';

import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { MarketService } from '../../src/api/services/MarketService';

describe('ShippingDestination', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let shippingDestinationService: ShippingDestinationService;
    let marketService: MarketService;

    let createdId;

    let listingItem;

    let defaultMarket;

    const testData = {
        country: Country.UNITED_KINGDOM,
        shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
    };

    const testDataUpdated = {
        country: Country.EU,
        shippingAvailability: ShippingAvailability.SHIPS
    };

    const listingItemData = {
        hash: 'hash1',
        itemInformation: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            itemCategory: {
                key: 'cat_high_luxyry_items',
                name: 'Luxury Items',
                description: ''
            },
            itemLocation: {
                region: Country.SOUTH_AFRICA,
                address: 'asdf, asdf, asdf',
                locationMarker: {
                    markerTitle: 'Helsinki',
                    markerText: 'Helsinki',
                    lat: 12.1234,
                    lng: 23.2314
                }
            },
            shippingDestinations: [ /*{
                    country: Country.UNITED_KINGDOM,
                    shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
                }, {
                    country: Country.ASIA,
                    shippingAvailability: ShippingAvailability.SHIPS
                }, {
                    country: Country.SOUTH_AFRICA,
                    shippingAvailability: ShippingAvailability.ASK
                }*/ ],
            itemImages: [{
                hash: 'imagehash1',
                data: {
                    dataId: 'dataid1',
                    protocol: ImageDataProtocolType.IPFS,
                    encoding: null,
                    data: null
                }
            }, {
                hash: 'imagehash2',
                data: {
                    dataId: 'dataid2',
                    protocol: ImageDataProtocolType.LOCAL,
                    encoding: 'BASE64',
                    data: 'BASE64 encoded image data'
                }
            }, {
                hash: 'imagehash3',
                data: {
                    dataId: 'dataid3',
                    protocol: ImageDataProtocolType.SMSG,
                    encoding: null,
                    data: 'smsgdata'
                }
            }]
        },
        paymentInformation: {
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
                basePrice: 0.0001,
                shippingPrice: {
                    domestic: 0.123,
                    international: 1.234
                }
                /*,
                cryptocurrencyAddress: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: '1234'
                }*/
            }
        },
        messagingInformation: [{
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey1'
        }]
        // TODO: ignoring listingitemobjects for now
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.ShippingDestinationService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

        defaultMarket = await marketService.getDefault();
        defaultMarket = defaultMarket.toJSON();
        log.debug('defaultMarket: ', defaultMarket);

        listingItemData['market_id'] = defaultMarket.id;
    });

    afterAll(async () => {
        //
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await shippingDestinationService.create(testData).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new shipping destination', async () => {
        listingItem = await testDataService.create({
            model: 'listingitem',
            withRelated: true,
            data: listingItemData
        });
        listingItem = listingItem.toJSON();
        testData['item_information_id'] = listingItem.ItemInformation.id;

        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.create(testData);
        createdId = shippingDestinationModel.Id;

        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should throw ValidationException because we want to create a empty shipping destination', async () => {
        expect.assertions(1);
        await shippingDestinationService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list shipping destinations with our new create one', async () => {
        const shippingDestinationCollection = await shippingDestinationService.findAll();
        const shippingDestination = shippingDestinationCollection.toJSON();
        expect(shippingDestination.length).toBe(1);

        const result = shippingDestination[0];

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should return one shipping destination', async () => {
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.findOne(createdId);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testData.country);
        expect(result.shippingAvailability).toBe(testData.shippingAvailability);
    });

    test('Should throw ValidationException because there is no item_information_id', async () => {
        expect.assertions(1);
        await shippingDestinationService.update(createdId, testDataUpdated).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should update the shipping destination', async () => {
        testDataUpdated['item_information_id'] = 0;
        const shippingDestinationModel: ShippingDestination = await shippingDestinationService.update(createdId, testDataUpdated);
        const result = shippingDestinationModel.toJSON();

        expect(result.country).toBe(testDataUpdated.country);
        expect(result.shippingAvailability).toBe(testDataUpdated.shippingAvailability);
    });

    test('Should delete the shipping destination', async () => {
        expect.assertions(1);
        await shippingDestinationService.destroy(createdId);
        await shippingDestinationService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
