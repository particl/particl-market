import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';

import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';

describe('ListingItemTemplate', () => {

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemTemplateService: ListingItemTemplateService;

    let createdId;

    const testData = {
        hash: 'hash1',
        itemInformation: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            itemCategory: {
                name: 'ROOT',
                description: 'item category description 1'
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
            shippingDestinations: [{
                country: Country.UNITED_KINGDOM,
                shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
            }, {
                country: Country.ASIA,
                shippingAvailability: ShippingAvailability.SHIPS
            }, {
                country: Country.SOUTH_AFRICA,
                shippingAvailability: ShippingAvailability.ASK
            }],
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
                },
                address: {
                    type: CryptocurrencyAddressType.NORMAL,
                    address: '1234'
                }
            }
        },
        messagingInformation: {
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey1'
        }
        // TODO: ignoring listingitemobjects for now
    };

    const testDataUpdated = {
        hash: 'hash2',
        itemInformation: {
            title: 'title UPDATED',
            shortDescription: 'item UPDATED',
            longDescription: 'item UPDATED',
            itemCategory: {
                name: 'CHILD',
                description: 'item UPDATED'
            },
            itemLocation: {
                region: Country.FINLAND,
                address: 'asdf UPDATED',
                locationMarker: {
                    markerTitle: 'UPDATED',
                    markerText: 'UPDATED',
                    lat: 33.333,
                    lng: 44.333
                }
            },
            shippingDestinations: [{
                country: Country.EU,
                shippingAvailability: ShippingAvailability.SHIPS
            }],
            itemImages: [{
                hash: 'imagehash1 UPDATED',
                data: {
                    dataId: 'dataid1 UPDATED',
                    protocol: ImageDataProtocolType.IPFS,
                    encoding: null,
                    data: null
                }
            }]
        },
        paymentInformation: {
            type: PaymentType.FREE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 1,
                    seller: 1
                }
            },
            itemPrice: {
                currency: Currency.PARTICL,
                basePrice: 3.333,
                shippingPrice: {
                    domestic: 1.111,
                    international: 2.222
                },
                address: {
                    type: CryptocurrencyAddressType.STEALTH,
                    address: '1234 UPDATED'
                }
            }
        },
        messagingInformation: {
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey1 UPDATED'
        }
        // TODO: ignoring listingitemobjects for now
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new listing item template', async () => {
        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testData);
        createdId = listingItemTemplateModel.Id;

        const result = listingItemTemplateModel.toJSON();

        expect(result.hash).toBe(testData.hash);
        expect(result.ItemInformation.title).toBe(testData.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testData.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testData.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testData.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testData.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testData.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testData.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(result.ItemInformation.ItemImages).toHaveLength(3);
        expect(result.PaymentInformation.type).toBe(testData.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.Address.type).toBe(testData.paymentInformation.itemPrice.address.type);
        expect(result.PaymentInformation.ItemPrice.Address.address).toBe(testData.paymentInformation.itemPrice.address.address);
        expect(result.MessagingInformation.protocol).toBe(testData.messagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(testData.messagingInformation.publicKey);

    });

    test('Should throw ValidationException because we want to create a empty listing item template', async () => {
        expect.assertions(1);
        await listingItemTemplateService.create({}).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list listing item templates with our new create one', async () => {
        const listingItemTemplateCollection = await listingItemTemplateService.findAll();
        const listingItemTemplate = listingItemTemplateCollection.toJSON();
        expect(listingItemTemplate.length).toBe(1);

        const result = listingItemTemplate[0];

        // test the values
        // expect(result.value).toBe(testData.value);
    });

    test('Should return one listing item template', async () => {
        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.findOne(createdId);
        const result = listingItemTemplateModel.toJSON();

        // test the values
        // expect(result.value).toBe(testData.value);
    });

    test('Should update the listing item template', async () => {
        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.update(createdId, testDataUpdated);
        const result = listingItemTemplateModel.toJSON();

        // test the values
        // expect(result.value).toBe(testDataUpdated.value);
    });

    test('Should delete the listing item template', async () => {
        await listingItemTemplateService.destroy(createdId);

        await listingItemTemplateService.findOne(createdId).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );
    });

});
