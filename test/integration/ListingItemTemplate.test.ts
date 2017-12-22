import { app } from '../../src/app';
import * as crypto from 'crypto-js';
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
import { ProfileService } from '../../src/api/services/ProfileService';
import { ItemInformationService } from '../../src/api/services/ItemInformationService';
import { PaymentInformationService } from '../../src/api/services/PaymentInformationService';
import { MessagingInformationService } from '../../src/api/services/MessagingInformationService';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ListingItemTemplateUpdateRequest } from '../../src/api/requests/ListingItemTemplateUpdateRequest';

describe('ListingItemTemplate', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemTemplateService: ListingItemTemplateService;
    let itemInformationService: ItemInformationService;
    let paymentInformationService: PaymentInformationService;
    let messagingInformationService: MessagingInformationService;
    let profileService: ProfileService;

    let createdId;
    let createdItemInformationId;
    let createdPaymentInformationId;
    let createdMessagingInformationId;
    let defaultProfile;

    const testData = {
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
                cryptocurrencyAddress: {
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
    } as ListingItemTemplateCreateRequest;

    const testDataUpdated = {
        hash: 'hash2',
        itemInformation: {
            title: 'title UPDATED',
            shortDescription: 'item UPDATED',
            longDescription: 'item UPDATED',
            itemCategory: {
                key: 'cat_apparel_adult',
                name: 'Adult',
                description: ''
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
                cryptocurrencyAddress: {
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
    } as ListingItemTemplateUpdateRequest;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);
        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.PaymentInformationService);
        messagingInformationService = app.IoC.getNamed<MessagingInformationService>(Types.Service, Targets.Service.MessagingInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);
        defaultProfile = await profileService.getDefault();
    });

    // todo:
    // - need more update tests
    // - need to test listingitems related to listingitemtemplate
    // - need to check deletes remove everything

    test('Should create a new listing item template without iteminfo, paymentinfo, messaginginfo and objects', async () => {
        // update the hash
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();

        const testDataToSave = JSON.parse(JSON.stringify(testData));
        // listingitemtemplate is always related to some profile
        testDataToSave.profile_id = defaultProfile.Id;
        // remove the stuff that we dont need in this test
        delete testDataToSave.itemInformation;
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        createdId = listingItemTemplateModel.Id;

        const result = listingItemTemplateModel.toJSON();
        // log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.hash).toBe(testDataToSave.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

    });

    test('Should throw ValidationException because we want to create a empty listing item template', async () => {
        expect.assertions(1);
        await listingItemTemplateService.create({} as ListingItemTemplateCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should list listing item templates with our new create one', async () => {
        const listingItemTemplateCollection = await listingItemTemplateService.findAll();
        const listingItemTemplate = listingItemTemplateCollection.toJSON();
        expect(listingItemTemplate.length).toBe(1);

        const result = listingItemTemplate[0];

        expect(result.hash).toBe(testData.hash);
    });

    test('Should return one simple listing item template', async () => {
        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.findOne(createdId);
        const result = listingItemTemplateModel.toJSON();

        expect(result.hash).toBe(testData.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

    });

    test('Should update the simple listing item template', async () => {
        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.update(createdId, testDataUpdated);
        const result = listingItemTemplateModel.toJSON();

        expect(result.hash).toBe(testDataUpdated.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        // tslint:disable:max-line-length
        /*
        expect(result.ItemInformation.title).toBe(testDataUpdated.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(testDataUpdated.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testDataUpdated.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testDataUpdated.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(testDataUpdated.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(testDataUpdated.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(testDataUpdated.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(testDataUpdated.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(1);
        expect(result.ItemInformation.ItemImages).toHaveLength(1);
        expect(result.ItemInformation.listingItemId).toBe(null);

        expect(result.PaymentInformation.type).toBe(testDataUpdated.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testDataUpdated.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testDataUpdated.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testDataUpdated.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testDataUpdated.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testDataUpdated.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testDataUpdated.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(testDataUpdated.paymentInformation.itemPrice.cryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testDataUpdated.paymentInformation.itemPrice.cryptocurrencyAddress.address);
        expect(result.PaymentInformation.listingItemId).toBe(null);

        expect(result.MessagingInformation.protocol).toBe(testDataUpdated.messagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(testDataUpdated.messagingInformation.publicKey);
        expect(result.MessagingInformation.listingItemId).toBe(null);
        */
        // tslint:enable:max-line-length
    });

    test('Should delete the listing item template', async () => {
        expect.assertions(1);
        // log.debug('createdId:', createdId);

        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

    });

    test('Should create a new listing item template without paymentinfo, messaginginfo and objects', async () => {
        // update the hash
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();

        const testDataToSave = JSON.parse(JSON.stringify(testData));

        // listingitemtemplate is always related to some profile
        testDataToSave.profile_id = defaultProfile.Id;

        // remove the stuff that we dont need in this test
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        const result = listingItemTemplateModel.toJSON();

        createdId = result.id;
        createdItemInformationId = result.ItemInformation.id;
        // log.debug('result:', JSON.stringify(result, null, 2));

        expect(result.hash).toBe(testData.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

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
        expect(result.ItemInformation.listingItemId).toBe(null);
        expect(result.ItemInformation.listingItemTemplateId).toBe(createdId);
    });

    test('Should delete the listing item template with item info', async () => {
        expect.assertions(2);

        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        await itemInformationService.findOne(createdItemInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformationId))
        );

        // TODO: test that all the other related data was also removed
    });

    test('Should create a new listing item template without messaginginfo and objects', async () => {
        // update the hash
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();

        const testDataToSave = JSON.parse(JSON.stringify(testData));

        // listingitemtemplate is always related to some profile
        testDataToSave.profile_id = defaultProfile.Id;

        // remove the stuff that we dont need in this test
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        const result = listingItemTemplateModel.toJSON();

        createdId = result.id;
        createdItemInformationId = result.ItemInformation.id;
        createdPaymentInformationId = result.PaymentInformation.id;

        expect(result.hash).toBe(testData.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

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
        expect(result.ItemInformation.listingItemId).toBe(null);
        expect(result.ItemInformation.listingItemTemplateId).toBe(createdId);

        expect(result.PaymentInformation.type).toBe(testData.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(testData.paymentInformation.itemPrice.cryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testData.paymentInformation.itemPrice.cryptocurrencyAddress.address);
        expect(result.PaymentInformation.listingItemId).toBe(null);
        expect(result.PaymentInformation.listingItemTemplateId).toBe(createdId);

    });

    test('Should delete the listing item template with item info and payment info', async () => {
        expect.assertions(3);

        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        await itemInformationService.findOne(createdItemInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformationId))
        );

        await paymentInformationService.findOne(createdPaymentInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformationId))
        );

        // TODO: test that all the other related data was also removed
    });

    test('Should create a new listing item template without objects', async () => {
        // update the hash
        testData.hash = crypto.SHA256(new Date().getTime().toString()).toString();

        const testDataToSave = JSON.parse(JSON.stringify(testData));

        // listingitemtemplate is always related to some profile
        testDataToSave.profile_id = defaultProfile.Id;

        // remove the stuff that we dont need in this test
        delete testDataToSave.listingItemObjects;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        const result = listingItemTemplateModel.toJSON();

        createdId = result.id;
        createdItemInformationId = result.ItemInformation.id;
        createdPaymentInformationId = result.PaymentInformation.id;
        createdMessagingInformationId = result.PaymentInformation.id;

        expect(result.hash).toBe(testData.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

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
        expect(result.ItemInformation.listingItemId).toBe(null);
        expect(result.ItemInformation.listingItemTemplateId).toBe(createdId);

        expect(result.PaymentInformation.type).toBe(testData.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(testData.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(testData.paymentInformation.escrow.ratio.seller);
        expect(result.PaymentInformation.ItemPrice.currency).toBe(testData.paymentInformation.itemPrice.currency);
        expect(result.PaymentInformation.ItemPrice.basePrice).toBe(testData.paymentInformation.itemPrice.basePrice);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.domestic).toBe(testData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(result.PaymentInformation.ItemPrice.ShippingPrice.international).toBe(testData.paymentInformation.itemPrice.shippingPrice.international);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.type).toBe(testData.paymentInformation.itemPrice.cryptocurrencyAddress.type);
        expect(result.PaymentInformation.ItemPrice.CryptocurrencyAddress.address).toBe(testData.paymentInformation.itemPrice.cryptocurrencyAddress.address);
        expect(result.PaymentInformation.listingItemId).toBe(null);
        expect(result.PaymentInformation.listingItemTemplateId).toBe(createdId);

        expect(result.MessagingInformation.protocol).toBe(testData.messagingInformation.protocol);
        expect(result.MessagingInformation.publicKey).toBe(testData.messagingInformation.publicKey);
        expect(result.MessagingInformation.listingItemId).toBe(null);
        expect(result.MessagingInformation.listingItemTemplateId).toBe(createdId);
    });

    test('Should delete the listing item template with item info and payment info', async () => {
        expect.assertions(4);

        await listingItemTemplateService.destroy(createdId);
        await listingItemTemplateService.findOne(createdId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdId))
        );

        await itemInformationService.findOne(createdItemInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformationId))
        );

        await paymentInformationService.findOne(createdPaymentInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformationId))
        );

        await messagingInformationService.findOne(createdMessagingInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdMessagingInformationId))
        );

        // TODO: test that all the other related data was also removed
    });

});
