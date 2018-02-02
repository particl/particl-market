import * as Bookshelf from 'bookshelf';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ItemCategoryService } from '../../src/api/services/ItemCategoryService';
import { AddressService } from '../../src/api/services/AddressService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { MessageException } from '../../src/api/exceptions/MessageException';

import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';
import { Profile } from '../../src/api/models/Profile';

import { TestDataCreateRequest } from '../../src/api/requests/TestDataCreateRequest';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';

import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';

describe('TestDataService', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let itemCategoryService: ItemCategoryService;
    let addressService: AddressService;
    let profileService: ProfileService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        itemCategoryService = app.IoC.getNamed<ItemCategoryService>(Types.Service, Targets.Service.ItemCategoryService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        addressService = app.IoC.getNamed<AddressService>(Types.Service, Targets.Service.AddressService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);

        // clean up the db
        await testDataService.clean();
    });

    afterAll(async () => {
        //
        // log.info('afterAll');
    });

    test('Should find the default categories + profile + market after startup', async () => {
        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(80);

        const profile = await profileService.findAll();
        expect(profile).toHaveLength(1);

        const market = await marketService.findAll();
        expect(market).toHaveLength(1);
    });


    test('Should not create default modals if seed=false', async () => {
        // clean removes all
        await testDataService.clean(false);
        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(0);

        const profile = await profileService.findAll();
        expect(profile).toHaveLength(0);

        const market = await itemCategoryService.findAll();
        expect(market).toHaveLength(0);
    });

    // test('Should skip cleanup of given table', async () => {
    //     await listingItemService.create({hash: 'ASDF'});
    //     await testDataService.clean(['listing_items']);

    //     const listingItems = await listingItemService.findAll();
    //     expect(listingItems).toHaveLength(1);
    // });


    test('Should create test data as par model', async () => {
        await testDataService.clean();
        const model = 'listingitemtemplate';
        const defaultProfile = await profileService.getDefault();
        const listingItemTemplateData = {
            profile_id: defaultProfile.Id,
            hash: 'itemhash',
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
                    region: 'South Africa',
                    address: 'asdf, asdf, asdf',
                    locationMarker: {
                        markerTitle: 'Helsinki',
                        markerText: 'Helsinki',
                        lat: 12.1234,
                        lng: 23.2314
                    }
                },
                shippingDestinations: [{
                    country: 'United Kingdom',
                    shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
                }, {
                    country: 'China',
                    shippingAvailability: ShippingAvailability.SHIPS
                }, {
                    country: 'South Africa',
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
                        data: ImageProcessing.milkcat
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
            messagingInformation: [{
                protocol: MessagingProtocolType.SMSG,
                publicKey: 'publickey1'
            }]
        };
        const createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model,
            data: listingItemTemplateData as any,
            withRelated: true
        } as TestDataCreateRequest);

        const result = createdListingItemTemplate.toJSON();
        // tslint:disable:max-line-length
        const listingItemTemplate = await listingItemTemplateService.findAll();
        expect(listingItemTemplate).toHaveLength(1);

        expect(result.hash).toBe(listingItemTemplateData.hash);
        expect(result.Profile.name).toBe(defaultProfile.Name);

        expect(result.ItemInformation.title).toBe(listingItemTemplateData.itemInformation.title);
        expect(result.ItemInformation.shortDescription).toBe(listingItemTemplateData.itemInformation.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(listingItemTemplateData.itemInformation.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(listingItemTemplateData.itemInformation.itemCategory.name);
        expect(result.ItemInformation.ItemCategory.description).toBe(listingItemTemplateData.itemInformation.itemCategory.description);
        expect(result.ItemInformation.ItemLocation.region).toBe(listingItemTemplateData.itemInformation.itemLocation.region);
        expect(result.ItemInformation.ItemLocation.address).toBe(listingItemTemplateData.itemInformation.itemLocation.address);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerTitle).toBe(listingItemTemplateData.itemInformation.itemLocation.locationMarker.markerTitle);
        expect(result.ItemInformation.ItemLocation.LocationMarker.markerText).toBe(listingItemTemplateData.itemInformation.itemLocation.locationMarker.markerText);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lat).toBe(listingItemTemplateData.itemInformation.itemLocation.locationMarker.lat);
        expect(result.ItemInformation.ItemLocation.LocationMarker.lng).toBe(listingItemTemplateData.itemInformation.itemLocation.locationMarker.lng);
        expect(result.ItemInformation.ShippingDestinations).toHaveLength(3);
        expect(result.ItemInformation.ItemImages).toHaveLength(3);
        expect(result.ItemInformation.listingItemId).toBe(null);
        expect(result.ItemInformation.listingItemTemplateId).toBe(result.id);

        expect(result.PaymentInformation.type).toBe(listingItemTemplateData.paymentInformation.type);
        expect(result.PaymentInformation.Escrow.type).toBe(listingItemTemplateData.paymentInformation.escrow.type);
        expect(result.PaymentInformation.Escrow.Ratio.buyer).toBe(listingItemTemplateData.paymentInformation.escrow.ratio.buyer);
        expect(result.PaymentInformation.Escrow.Ratio.seller).toBe(listingItemTemplateData.paymentInformation.escrow.ratio.seller);
        const resItemPrice = result.PaymentInformation.ItemPrice;
        expect(resItemPrice.currency).toBe(listingItemTemplateData.paymentInformation.itemPrice.currency);
        expect(resItemPrice.basePrice).toBe(listingItemTemplateData.paymentInformation.itemPrice.basePrice);
        expect(resItemPrice.ShippingPrice.domestic).toBe(listingItemTemplateData.paymentInformation.itemPrice.shippingPrice.domestic);
        expect(resItemPrice.ShippingPrice.international).toBe(listingItemTemplateData.paymentInformation.itemPrice.shippingPrice.international);

        expect(result.MessagingInformation[0].protocol).toBe(listingItemTemplateData.messagingInformation[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(listingItemTemplateData.messagingInformation[0].publicKey);
        expect(result.MessagingInformation[0].listingItemId).toBe(null);
        // tslint:enable:max-line-length
    });

    test('Should throw error message when passed model is invalid for create', async () => {
        expect.assertions(1);
        const model = 'testmodel';
        const createdData = await testDataService.create<ListingItemTemplate>({
            model,
            data: {
                hash : '123'
            } as any,
            withRelated: true
        } as TestDataCreateRequest).catch(e =>
            expect(e).toEqual(new MessageException('Not implemented'))
        );
    });

    test('Should generate single test data as par model', async () => {
        await testDataService.clean(false);
        const model = 'profile';
        const profiles: Bookshelf.Collection<Profile> = await testDataService.generate<Profile>({
            model,
            amount: 1,
            withRelated: true
        } as TestDataGenerateRequest);
        const createdProfile = profiles[0].toJSON();
        // CryptocurrencyAddresses
        expect(createdProfile.CryptocurrencyAddresses).not.toHaveLength(0);
        expect(createdProfile.CryptocurrencyAddresses[0].profileId).toBe(createdProfile.id);
        expect(createdProfile.CryptocurrencyAddresses[0].address).not.toBeNull();
        expect(createdProfile.CryptocurrencyAddresses[0].type).not.toBeNull();
        // FavoriteItems
        expect(createdProfile.FavoriteItems).toHaveLength(0);
        // ShippingAddresses
        expect(createdProfile.ShippingAddresses).not.toHaveLength(0);
        expect(createdProfile.ShippingAddresses[0].profileId).toBe(createdProfile.id);
        expect(createdProfile.ShippingAddresses[0].addressLine1).not.toBeNull();
        expect(createdProfile.ShippingAddresses[0].addressLine2).not.toBeNull();
        expect(createdProfile.ShippingAddresses[0].city).not.toBeNull();
        expect(createdProfile.ShippingAddresses[0].country).not.toBeNull();
        expect(createdProfile.ShippingAddresses[0].title).not.toBeNull();
        expect(createdProfile.ShippingAddresses[0].zipCode).not.toBeNull();
        // normal field
        expect(createdProfile.address).not.toBeNull();
        expect(createdProfile.name).not.toBeNull();

        const profile = await profileService.findAll();
        expect(profile).toHaveLength(1);
    });

    test('Should generate single test data as par model with withRelated: false', async () => {
        await testDataService.clean(false);
        const model = 'profile';
        const profiles: Bookshelf.Collection<Profile> = await testDataService.generate<Profile>({
            model,
            amount: 1,
            withRelated: false
        } as TestDataGenerateRequest);
        const createdProfile = profiles[0];
        expect(createdProfile).toBeGreaterThan(0);
        // CryptocurrencyAddresses
        expect(createdProfile.CryptocurrencyAddresses).not.toBeDefined();
        expect(createdProfile.FavoriteItems).not.toBeDefined();
        expect(createdProfile.ShippingAddresses).not.toBeDefined();

        const profile = await profileService.findAll();
        expect(profile).toHaveLength(1);
    });

    test('Should generate three test data as par model', async () => {
        await testDataService.clean(false);
        const model = 'profile';
        const profiles: Bookshelf.Collection<Profile> = await testDataService.generate<Profile>({
            model,
            amount: 3,
            withRelated: true
        } as TestDataGenerateRequest);

        const profile = await profileService.findAll();
        expect(profile).toHaveLength(3);
    });

    test('Should throw error message when passed model is invalid for generate', async () => {
        expect.assertions(1);
        const model = 'testmodel';
        await testDataService.generate<Profile>({
            model,
            amount: 1,
            withRelated: true
        } as TestDataGenerateRequest).catch(e =>
            expect(e).toEqual(new MessageException('Not implemented'))
        );
    });

    test('Should cleanup all tables', async () => {
        expect.assertions(4);
        // clean removes all and then seeds the default category and profile data
        await testDataService.clean([]);

        const categories = await itemCategoryService.findAll();
        expect(categories).toHaveLength(80);

        // default profile should not contain addresses
        const addresses = await addressService.findAll();
        expect(addresses).toHaveLength(0);

        // listingitemTemplates should have been be removed
        const listingItems = await listingItemTemplateService.findAll();
        expect(listingItems).toHaveLength(0);

        // only default profile
        const profiles = await profileService.findAll();
        expect(profiles).toHaveLength(1);
    });

});
