// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import * as Faker from 'faker';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Targets, Types } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { TestDataService } from '../../src/api/services/TestDataService';
import { ListingItemTemplateService } from '../../src/api/services/model/ListingItemTemplateService';
import { ProfileService } from '../../src/api/services/model/ProfileService';
import { ItemInformationService } from '../../src/api/services/model/ItemInformationService';
import { ItemLocationService } from '../../src/api/services/model/ItemLocationService';
import { LocationMarkerService } from '../../src/api/services/model/LocationMarkerService';
import { ShippingDestinationService } from '../../src/api/services/model/ShippingDestinationService';
import { ItemImageService } from '../../src/api/services/model/ItemImageService';
import { PaymentInformationService } from '../../src/api/services/model/PaymentInformationService';
import { EscrowService } from '../../src/api/services/model/EscrowService';
import { EscrowRatioService } from '../../src/api/services/model/EscrowRatioService';
import { ItemPriceService } from '../../src/api/services/model/ItemPriceService';
import { ShippingPriceService } from '../../src/api/services/model/ShippingPriceService';
import { CryptocurrencyAddressService } from '../../src/api/services/model/CryptocurrencyAddressService';
import { MessagingInformationService } from '../../src/api/services/model/MessagingInformationService';
import { ListingItemService } from '../../src/api/services/model/ListingItemService';
import { MarketService } from '../../src/api/services/model/MarketService';
import { ListingItemObjectService } from '../../src/api/services/model/ListingItemObjectService';
import { ListingItemObjectDataService } from '../../src/api/services/model/ListingItemObjectDataService';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/model/ListingItemTemplateCreateRequest';
import { ListingItemObjectCreateRequest } from '../../src/api/requests/model/ListingItemObjectCreateRequest';
import { MessagingInformationCreateRequest } from '../../src/api/requests/model/MessagingInformationCreateRequest';
import { PaymentInformationCreateRequest } from '../../src/api/requests/model/PaymentInformationCreateRequest';
import { ItemInformationCreateRequest } from '../../src/api/requests/model/ItemInformationCreateRequest';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/testdata/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/testdata/TestDataGenerateRequest';
import { ShippingCountries } from '../../src/core/helpers/ShippingCountries';
import { LocationMarkerCreateRequest } from '../../src/api/requests/model/LocationMarkerCreateRequest';
import { ItemLocationCreateRequest } from '../../src/api/requests/model/ItemLocationCreateRequest';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ShippingDestinationCreateRequest } from '../../src/api/requests/model/ShippingDestinationCreateRequest';
import { ProtocolDSN } from 'omp-lib/dist/interfaces/dsn';
import { ImageVersions } from '../../src/core/helpers/ImageVersionEnumType';
import { ItemImageDataCreateRequest } from '../../src/api/requests/model/ItemImageDataCreateRequest';
import { ItemImageCreateRequest } from '../../src/api/requests/model/ItemImageCreateRequest';
import { EscrowReleaseType, EscrowType, MessagingProtocol, SaleType } from 'omp-lib/dist/interfaces/omp-enums';
import { EscrowRatioCreateRequest } from '../../src/api/requests/model/EscrowRatioCreateRequest';
import { EscrowCreateRequest } from '../../src/api/requests/model/EscrowCreateRequest';
import { CryptoAddressType, Cryptocurrency } from 'omp-lib/dist/interfaces/crypto';
import { toSatoshis } from 'omp-lib/dist/util';
import { ShippingPriceCreateRequest } from '../../src/api/requests/model/ShippingPriceCreateRequest';
import { CryptocurrencyAddressCreateRequest } from '../../src/api/requests/model/CryptocurrencyAddressCreateRequest';
import { ItemPriceCreateRequest } from '../../src/api/requests/model/ItemPriceCreateRequest';
import { MessageException } from '../../src/api/exceptions/MessageException';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';
import { ListingItemObjectDataCreateRequest } from '../../src/api/requests/model/ListingItemObjectDataCreateRequest';

describe('ListingItemTemplate', async () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemTemplateService: ListingItemTemplateService;
    let itemInformationService: ItemInformationService;
    let itemLocationService: ItemLocationService;
    let locationMarkerService: LocationMarkerService;
    let shippingDestinationService: ShippingDestinationService;
    let itemImageService: ItemImageService;
    let paymentInformationService: PaymentInformationService;
    let escrowService: EscrowService;
    let escrowRatioService: EscrowRatioService;
    let itemPriceService: ItemPriceService;
    let shippingPriceService: ShippingPriceService;
    let cryptocurrencyAddressService: CryptocurrencyAddressService;
    let messagingInformationService: MessagingInformationService;
    let profileService: ProfileService;
    let listingItemService: ListingItemService;
    let marketService: MarketService;
    let listingItemObjectService: ListingItemObjectService;
    let listingItemObjectDataService: ListingItemObjectDataService;

    let listingItemTemplate: resources.ListingItemTemplate;

    let profile: resources.Profile;
    let market: resources.Market;

    beforeAll(async () => {

        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.model.ListingItemTemplateService);

        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.model.ItemInformationService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.model.ItemLocationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.model.LocationMarkerService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.model.ShippingDestinationService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.model.ItemImageService);

        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.model.PaymentInformationService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.model.EscrowService);
        escrowRatioService = app.IoC.getNamed<EscrowRatioService>(Types.Service, Targets.Service.model.EscrowRatioService);
        itemPriceService = app.IoC.getNamed<ItemPriceService>(Types.Service, Targets.Service.model.ItemPriceService);
        shippingPriceService = app.IoC.getNamed<ShippingPriceService>(Types.Service, Targets.Service.model.ShippingPriceService);
        cryptocurrencyAddressService = app.IoC.getNamed<CryptocurrencyAddressService>(Types.Service, Targets.Service.model.CryptocurrencyAddressService);

        messagingInformationService = app.IoC.getNamed<MessagingInformationService>(Types.Service, Targets.Service.model.MessagingInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.model.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.model.ListingItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.model.MarketService);
        listingItemObjectService = app.IoC.getNamed<ListingItemObjectService>(Types.Service, Targets.Service.model.ListingItemObjectService);
        listingItemObjectDataService = app.IoC.getNamed<ListingItemObjectDataService>(Types.Service, Targets.Service.model.ListingItemObjectDataService);

        profile = await profileService.getDefault().then(value => value.toJSON());
        market = await marketService.getDefaultForProfile(profile.id).then(value => value.toJSON());

    });

    const expectListingItemTemplateFromCreateRequest = (result: resources.ListingItemTemplate, createRequest: ListingItemTemplateCreateRequest) => {
        // log.debug('result: ', JSON.stringify(result, null, 2));
        expect(result.id).not.toBeNull();

        if (!_.isEmpty(createRequest.itemInformation)) {
            expectItemInformationFromCreateRequest(result.ItemInformation, createRequest.itemInformation);
        } else {
            expect(result.ItemInformation).toEqual({});
        }

        if (!_.isEmpty(createRequest.paymentInformation)) {
            expectPaymentInformationFromCreateRequest(result.PaymentInformation, createRequest.paymentInformation);
        } else {
            expect(result.PaymentInformation).toEqual({});
        }

        if (!_.isEmpty(createRequest.messagingInformation)) {
            expectMessagingInformationFromCreateRequest(result.MessagingInformation, createRequest.messagingInformation);
        } else {
            expect(result.MessagingInformation).toEqual([]);
        }

        if (!_.isEmpty(createRequest.listingItemObjects)) {
            expectListingItemObjectsFromCreateRequest(result.ListingItemObjects, createRequest.listingItemObjects);
        } else {
            expect(result.ListingItemObjects).toEqual([]);
        }
    };

    const expectListingItemFromCreateRequest = (result: resources.ListingItem, createRequest: ListingItemTemplateCreateRequest) => {
        expect(result.id).not.toBeNull();
        expect(result.hash).not.toBeNull();

        if (!_.isEmpty(createRequest.itemInformation)) {
            expectItemInformationFromCreateRequest(result.ItemInformation, createRequest.itemInformation);
        } else {
            expect(result.ItemInformation).toEqual({});
        }

        if (!_.isEmpty(createRequest.paymentInformation)) {
            expectPaymentInformationFromCreateRequest(result.PaymentInformation, createRequest.paymentInformation);
        } else {
            expect(result.PaymentInformation).toEqual({});
        }

        if (!_.isEmpty(createRequest.messagingInformation)) {
            expectMessagingInformationFromCreateRequest(result.MessagingInformation, createRequest.messagingInformation);
        } else {
            expect(result.MessagingInformation).toEqual([]);
        }

        if (!_.isEmpty(createRequest.listingItemObjects)) {
            expectListingItemObjectsFromCreateRequest(result.ListingItemObjects, createRequest.listingItemObjects);
        } else {
            expect(result.ListingItemObjects).toEqual([]);
        }
    };

    const expectItemInformationFromCreateRequest = (result: resources.ItemInformation, createRequest: ItemInformationCreateRequest) => {
        expect(result.title).toBe(createRequest.title);
        expect(result.shortDescription).toBe(createRequest.shortDescription);
        expect(result.longDescription).toBe(createRequest.longDescription);
        expect(result.ItemLocation.country).toBe(createRequest.itemLocation.country);
        expect(result.ItemLocation.address).toBe(createRequest.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.title).toBe(createRequest.itemLocation.locationMarker.title);
        expect(result.ItemLocation.LocationMarker.description).toBe(createRequest.itemLocation.locationMarker.description);
        expect(result.ItemLocation.LocationMarker.lat).toBe(createRequest.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(createRequest.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(createRequest.shippingDestinations.length);
        expect(result.ItemImages).toHaveLength(createRequest.itemImages.length);
        if (createRequest.itemImages.length > 0) {
            expect(result.ItemImages[0].ItemImageDatas).toHaveLength(4); // 4 sizes
        }
    };

    const expectPaymentInformationFromCreateRequest = (result: resources.PaymentInformation, createRequest: PaymentInformationCreateRequest) => {
        expect(result.type).toBe(createRequest.type);
        expect(result.Escrow.type).toBe(createRequest.escrow.type);
        expect(result.Escrow.releaseType).toBe(createRequest.escrow.releaseType);
        expect(result.Escrow.Ratio.buyer).toBe(createRequest.escrow.ratio.buyer);
        expect(result.Escrow.Ratio.seller).toBe(createRequest.escrow.ratio.seller);
        expect(result.ItemPrice.currency).toBe(createRequest.itemPrice.currency);
        expect(result.ItemPrice.basePrice).toBe(createRequest.itemPrice.basePrice);
        expect(result.ItemPrice.ShippingPrice.domestic).toBe(createRequest.itemPrice.shippingPrice.domestic);
        expect(result.ItemPrice.ShippingPrice.international).toBe(createRequest.itemPrice.shippingPrice.international);
        expect(result.ItemPrice.CryptocurrencyAddress.type).toBe(createRequest.itemPrice.cryptocurrencyAddress.type);
        expect(result.ItemPrice.CryptocurrencyAddress.address).toBe(createRequest.itemPrice.cryptocurrencyAddress.address);
    };

    const expectMessagingInformationFromCreateRequest = (results: resources.MessagingInformation[], createRequest: MessagingInformationCreateRequest[]) => {
        expect(results[0].protocol).toBe(createRequest[0].protocol);
        expect(results[0].publicKey).toBe(createRequest[0].publicKey);
    };

    const expectListingItemObjectsFromCreateRequest = (results: resources.ListingItemObject[], createRequest: ListingItemObjectCreateRequest[]) => {
        expect(results[0].type).toBe(createRequest[0].type);
        expect(results[0].description).toBe(createRequest[0].description);
        expect(results[0].order).toBe(createRequest[0].order);
        expect(results[0].objectId).toBeDefined();
        expect(results[0].forceInput).toBeDefined();

        const objectDataResults = results[0].ListingItemObjectDatas;
        expect(objectDataResults[0].key).toBe(createRequest[0].listingItemObjectDatas[0].key);
        expect(objectDataResults[0].value).toBe(createRequest[0].listingItemObjectDatas[0].value);
    };

    const expectListingItemTemplateWasDeleted = async (item: resources.ListingItemTemplate) => {

        log.debug('item to delete: ', JSON.stringify(item, null, 2));
        log.debug('expect deleted, item.id:', item.id);

        await listingItemTemplateService.findOne(item.id)
            .then(value => {
                throw new MessageException('ListingItemTemplate still found.');
            })
            .catch(e =>
                expect(e).toEqual(new NotFoundException(item.id))
            );

        // ListingItemTemplate                                          14 expects
        // ListingItemTemplate.ItemInformation                              4 expects
        // ListingItemTemplate.ItemInformation.ItemLocation,                    2 expects
        // ListingItemTemplate.ItemInformation.ItemLocation.LocationMarker,         1 expect
        // ListingItemTemplate.ItemInformation.ShippingDestinations             1 expect
        // ListingItemTemplate.ItemInformation.ItemImages                       1 expect
        // ListingItemTemplate.PaymentInformation                           6 expects
        // ListingItemTemplate.PaymentInformation.Escrow                        2 expects
        // ListingItemTemplate.PaymentInformation.Escrow.Ratio                      1 expect
        // ListingItemTemplate.PaymentInformation.ItemPrice                     3 expects
        // ListingItemTemplate.PaymentInformation.ItemPrice.ShippingPrice           1 expect
        // ListingItemTemplate.PaymentInformation.ItemPrice.CryptocurrencyAddress   1 expect
        // ListingItemTemplate.MessagingInformation                         1 expect
        // ListingItemTemplate.ListingItemObjects                           2 expects
        // ListingItemTemplate.ListingItemObjects.ListingItemObjectDatas        1 expect


        if (!_.isEmpty(item.ItemInformation)) {
            await itemInformationService.findOne(item.ItemInformation.id, false).catch(e =>
                expect(e).toEqual(new NotFoundException(item.ItemInformation.id))
            );

            // ItemLocation
            if (!_.isEmpty(item.ItemInformation.ItemLocation)) {
                const itemLocationId = item.ItemInformation.ItemLocation.id;
                await itemLocationService.findOne(itemLocationId, false).catch(e =>
                    expect(e).toEqual(new NotFoundException(itemLocationId))
                );

                // LocationMarker
                if (!_.isEmpty(item.ItemInformation.ItemLocation.LocationMarker)) {
                    const locationMarkerId = item.ItemInformation.ItemLocation.LocationMarker.id;
                    await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
                        expect(e).toEqual(new NotFoundException(locationMarkerId))
                    );
                }
            }

            // ShippingDestination
            if (!_.isEmpty(item.ItemInformation.ShippingDestinations)) {
                const shipDestinationId = item.ItemInformation.ShippingDestinations[0].id;
                await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
                    expect(e).toEqual(new NotFoundException(shipDestinationId))
                );
            }

            // ItemImage
            if (!_.isEmpty(item.ItemInformation.ItemImages)) {
                const itemImageId = item.ItemInformation.ItemImages[0].id;
                await itemImageService.findOne(itemImageId, false).catch(e =>
                    expect(e).toEqual(new NotFoundException(itemImageId))
                );
            }
        }

        // PaymentInformation
        if (!_.isEmpty(item.PaymentInformation)) {
            await paymentInformationService.findOne(item.PaymentInformation.id, false).catch(e =>
                expect(e).toEqual(new NotFoundException(item.PaymentInformation.id))
            );

            // Escrow
            if (!_.isEmpty(item.PaymentInformation.Escrow)) {
                const escrowId = item.PaymentInformation.Escrow.id;
                await escrowService.findOne(escrowId, false).catch(e =>
                    expect(e).toEqual(new NotFoundException(escrowId))
                );

                // EscrowRatio
                if (!_.isEmpty(item.PaymentInformation.Escrow)) {
                    const escrowRatioId = item.PaymentInformation.Escrow.Ratio.id;
                    await escrowRatioService.findOne(escrowRatioId, false).catch(e =>
                        expect(e).toEqual(new NotFoundException(escrowRatioId))
                    );
                }
            }

            // ItemPrice
            if (!_.isEmpty(item.PaymentInformation.ItemPrice)) {
                const itemPriceId = item.PaymentInformation.ItemPrice.id;
                await itemPriceService.findOne(itemPriceId, false).catch(e =>
                    expect(e).toEqual(new NotFoundException(itemPriceId))
                );

                // ShippingPrice
                if (!_.isEmpty(item.PaymentInformation.ItemPrice.ShippingPrice)) {
                    const shippingPriceId = item.PaymentInformation.ItemPrice.ShippingPrice.id;
                    await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
                        expect(e).toEqual(new NotFoundException(shippingPriceId))
                    );
                }

                // CryptocurrencyAddress
                if (!_.isEmpty(item.PaymentInformation.ItemPrice.CryptocurrencyAddress)) {
                    const cryptoCurrencyId = item.PaymentInformation.ItemPrice.CryptocurrencyAddress.id;
                    await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
                        expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
                    );
                }
            }
        }

        // MessagingInformation
        if (!_.isEmpty(item.MessagingInformation)) {
            const messagingInformationId = item.MessagingInformation[0].id;
            await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
                expect(e).toEqual(new NotFoundException(messagingInformationId))
            );
        }

        // ListingItemObjects
        if (!_.isEmpty(item.ListingItemObjects)) {

            const listingItemObjectId = item.ListingItemObjects[0].id;
            await listingItemObjectService.findOne(listingItemObjectId, false).catch(e =>
                expect(e).toEqual(new NotFoundException(listingItemObjectId))
            );

            // ListingItemObjectDatas
            if (!_.isEmpty(item.ListingItemObjects[0].ListingItemObjectDatas)) {
                const listingItemObjectData = item.ListingItemObjects[0].ListingItemObjectDatas[0];

                await listingItemObjectDataService.findOne(listingItemObjectData.id, false).catch(e =>
                    expect(e).toEqual(new NotFoundException(listingItemObjectData.id))
                );

            }
        }
    };

    const generateTemplatesAndListingItems = async (withListingItemAmount: number = 0, withoutListingItemAmount: number = 0):
        Promise<resources.ListingItemTemplate[]> => {

        let generatedTemplates: resources.ListingItemTemplate[] = [];

        const templateGenerateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateItemLocation
            true,   // generateShippingDestinations
            false,  // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            profile.id, // profileId
            true,   // generateListingItem
            market.id  // marketId
        ]);

        if (withListingItemAmount > 0) {
            // log.debug('templateGenerateParams:', JSON.stringify(templateGenerateParams, null, 2));
            const generateParams = templateGenerateParams.toParamsArray();
            const templates: resources.ListingItemTemplate[] = await testDataService.generate({
                model: CreatableModel.LISTINGITEMTEMPLATE,
                amount: withListingItemAmount,
                withRelated: true,
                generateParams
            } as TestDataGenerateRequest);
            generatedTemplates = generatedTemplates.concat(templates);
        }

        if (withoutListingItemAmount > 0) {
            templateGenerateParams.generateListingItem = false;
            // log.debug('templateGenerateParams:', JSON.stringify(templateGenerateParams, null, 2));

            const generateParams = templateGenerateParams.toParamsArray();
            const templates: resources.ListingItemTemplate[] = await testDataService.generate({
                model: CreatableModel.LISTINGITEMTEMPLATE,
                amount: withoutListingItemAmount,
                withRelated: true,
                generateParams
            } as TestDataGenerateRequest);
            generatedTemplates = generatedTemplates.concat(templates);
        }

        // log.debug('generatedTemplates:', JSON.stringify(generatedTemplates.length, null, 2));

        for (const generatedListingItemTemplate of generatedTemplates) {

            // expect the template to be related to correct profile
            expect(generatedListingItemTemplate.Profile.id).toBe(profile.id);

            if (generatedListingItemTemplate.ListingItems && generatedListingItemTemplate.ListingItems.length > 0 ) {
                // expect to find the listingItem with relation to the template
                const generatedListingItemModel = await listingItemService.findOne(generatedListingItemTemplate.ListingItems[0].id);
                const generatedListingItem = generatedListingItemModel.toJSON();
                expect(generatedListingItemTemplate.id).toBe(generatedListingItem.ListingItemTemplate.id);

                // expect the listingitem to be posted to the correct market
                expect(generatedListingItemTemplate.ListingItems[0].market).toBe(market.receiveAddress);

                // expect the item hash generated at the same time as template, matches with the templates one
                // log.debug('generatedListingItemTemplate.hash:', generatedListingItemTemplate.hash);
                // log.debug('generatedListingItemTemplate.ListingItems[0].hash:', generatedListingItemTemplate.ListingItems[0].hash);
                expect(generatedListingItemTemplate.hash).toBe(generatedListingItemTemplate.ListingItems[0].hash);
            }

            // expect template hash created on the server matches what we create here
            // log.debug('generatedListingItemTemplate.hash:', generatedListingItemTemplate.hash);
            // log.debug('generatedTemplateHash:', generatedTemplateHash);

            // TODO: fix this
            // const generatedTemplateHash = ObjectHashDEPRECATED.getHash(generatedListingItemTemplate, HashableObjectTypeDeprecated.LISTINGITEMTEMPLATE);
            // expect(generatedListingItemTemplate.hash).toBe(generatedTemplateHash);

        }

        return generatedTemplates;
    };

    const generateListingItemTemplateCreateRequest = async (withImage: boolean = false): Promise<ListingItemTemplateCreateRequest> => {
        const now = Date.now();
        const randomImageData1 = await testDataService.generateRandomImage(20, 20);
        const itemImages = withImage ? [{
            data: [{
                // when we receive ListingItemAddMessage -> ProtocolDSN.SMSG
                // when we receive ListingItemImageAddMessage -> ProtocolDSN.LOCAL
                protocol: ProtocolDSN.LOCAL,
                encoding: 'BASE64',
                dataId: 'https://particl.io/images/' + Faker.random.uuid(),
                imageVersion: ImageVersions.ORIGINAL.propName,
                data: randomImageData1
            }] as ItemImageDataCreateRequest[],
            featured: false,
            hash: 'TEST-IMAGEHASH1'
        }] as ItemImageCreateRequest[] : [] as ItemImageCreateRequest[];

        const createRequest = {
            profile_id: profile.id,
            generatedAt: now,
            itemInformation: {
                title: Faker.random.words(4),
                shortDescription: Faker.random.words(10),
                longDescription: Faker.random.words(30),
                itemLocation: {
                    country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                    address: Faker.address.streetAddress(),
                    description: Faker.lorem.paragraph(),
                    locationMarker: {
                        lat: _.random(-50, 50),
                        lng: _.random(-50, 50),
                        title: Faker.lorem.word(),
                        description: Faker.lorem.sentence()
                    } as LocationMarkerCreateRequest
                } as ItemLocationCreateRequest,
                shippingDestinations: [{
                    country: Faker.random.arrayElement(Object.getOwnPropertyNames(ShippingCountries.countryCodeList)),
                    shippingAvailability: ShippingAvailability.SHIPS
                }] as ShippingDestinationCreateRequest[],
                itemImages
            } as ItemInformationCreateRequest,
            paymentInformation: {
                type: SaleType.SALE,
                escrow: {
                    type: EscrowType.MAD_CT,
                    releaseType: EscrowReleaseType.ANON,
                    secondsToLock: 4,
                    ratio: {
                        buyer: 100,
                        seller: 100
                    } as EscrowRatioCreateRequest
                } as EscrowCreateRequest,
                itemPrice: {
                    currency: Cryptocurrency.PART, // Faker.random.arrayElement(Object.getOwnPropertyNames(Currency)),
                    basePrice: toSatoshis(+_.random(0.1, 1.00).toFixed(8)),
                    shippingPrice: {
                        domestic: toSatoshis(+_.random(0.01, 0.10).toFixed(8)),
                        international: toSatoshis(+_.random(0.10, 0.20).toFixed(8))
                    } as ShippingPriceCreateRequest,
                    cryptocurrencyAddress: {
                        type: CryptoAddressType.STEALTH,
                        address: Faker.finance.bitcoinAddress()
                    } as CryptocurrencyAddressCreateRequest
                } as ItemPriceCreateRequest
            } as PaymentInformationCreateRequest,
            messagingInformation: [{
                protocol: Faker.random.arrayElement(Object.getOwnPropertyNames(MessagingProtocol)),
                publicKey: Faker.random.uuid()
            }] as MessagingInformationCreateRequest[],
            listingItemObjects: [{
                type: Faker.random.arrayElement(Object.getOwnPropertyNames(ListingItemObjectType)),
                description: Faker.lorem.paragraph(),
                order: 0,
                listingItemObjectDatas: [{
                    key: Faker.lorem.slug(),
                    value: Faker.lorem.word()
                }] as ListingItemObjectDataCreateRequest[]
            }] as ListingItemObjectCreateRequest[]
        } as ListingItemTemplateCreateRequest;

        return createRequest;
    };


    // -------------------------------
    // TESTS
    // -------------------------------
    test('Should throw ValidationException because we want to create a empty ListingItemTemplate', async () => {
        expect.assertions(1);
        await listingItemTemplateService.create({} as ListingItemTemplateCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ListingItemTemplate', async () => {

        const testDataToSave: ListingItemTemplateCreateRequest = await generateListingItemTemplateCreateRequest(true);
        // log.debug('testDataToSave: ', JSON.stringify(testDataToSave, null, 2));
        listingItemTemplate = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(listingItemTemplate, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should findAll ListingItemTemplates containing the previously created one', async () => {
        const listingItemTemplates: resources.ListingItemTemplate = await listingItemTemplateService.findAll().then(value => value.toJSON());
        const result = listingItemTemplates[0];

        expect(listingItemTemplates).toHaveLength(1);
        expect(result.hash).toBe(listingItemTemplate.hash);
    });

    test('Should findOne ListingItemTemplate using id', async () => {
        const result: resources.ListingItemTemplate = await listingItemTemplateService.findOne(listingItemTemplate.id)
            .then(value => value.toJSON());

        expect(result.hash).toBe(listingItemTemplate.hash);
    });

    test('Should delete the created ListingItemTemplate', async () => {
        expect.assertions(14);
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await expectListingItemTemplateWasDeleted(listingItemTemplate);
    });

    test('Should create a new ListingItemTemplate without ItemInformation, PaymentInformation, MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave: ListingItemTemplateCreateRequest = await generateListingItemTemplateCreateRequest();

        // remove the stuff that we dont need in this test
        delete testDataToSave.itemInformation;
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;
        testDataToSave.generatedAt = +Date.now();

        listingItemTemplate = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(listingItemTemplate, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should delete the created ListingItemTemplate', async () => {
        expect.assertions(1);
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await expectListingItemTemplateWasDeleted(listingItemTemplate);
    });

    test('Should create a new ListingItemTemplate without Images, PaymentInformation, MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave: ListingItemTemplateCreateRequest = await generateListingItemTemplateCreateRequest();

        // remove the stuff that we dont need in this test
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;
        testDataToSave.generatedAt = +Date.now();

        listingItemTemplate = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(listingItemTemplate, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should delete the created ListingItemTemplate', async () => {
        expect.assertions(5);
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await expectListingItemTemplateWasDeleted(listingItemTemplate);
    });

    test('Should create a new ListingItemTemplate without Images, MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave: ListingItemTemplateCreateRequest = await generateListingItemTemplateCreateRequest();

        // remove the stuff that we dont need in this test
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;
        testDataToSave.generatedAt = +Date.now();

        listingItemTemplate = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(listingItemTemplate, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should delete the created ListingItemTemplate', async () => {
        expect.assertions(10);
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await expectListingItemTemplateWasDeleted(listingItemTemplate);
    });

    test('Should create a new ListingItemTemplate without Images, ListingItemObjects', async () => {
        const testDataToSave: ListingItemTemplateCreateRequest = await generateListingItemTemplateCreateRequest();

        // remove the stuff that we dont need in this test
        delete testDataToSave.listingItemObjects;
        testDataToSave.generatedAt = +Date.now();

        listingItemTemplate = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(listingItemTemplate, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should delete the created ListingItemTemplate', async () => {
        expect.assertions(11);
        await listingItemTemplateService.destroy(listingItemTemplate.id);
        await expectListingItemTemplateWasDeleted(listingItemTemplate);
    });

// TODO: updates, searchby tests, etc
/*
    test('Should update previously created ListingItemTemplate', async () => {
        const testDataToSave: ListingItemTemplateCreateRequest = await generateListingItemTemplateCreateRequest();

        updatedListingItemTemplate1 = await listingItemTemplateService.update(createdListingItemTemplate3.id, testDataToSave)
            .then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should delete the previously updated ListingItemTemplate', async () => {
        expect.assertions(21);
        await listingItemTemplateService.destroy(createdListingItemTemplate3.id);
        await expectListingItemTemplateWasDeleted(createdListingItemTemplate3);
    });
    */

    /*
    test('Should update ListingItemTemplate correctly when removing data', async () => {

        const testDataToUpdate = JSON.parse(JSON.stringify(listingItemTemplateUpdateRequestBasic1));

        testDataToUpdate.profile_id = defaultProfile.id;
        testDataToUpdate.generatedAt = +Date.now();

        // remove some data
        delete testDataToUpdate.listingItemObjects;
        updatedListingItemTemplate1 = await listingItemTemplateService.update(createdListingItemTemplate3.id, testDataToUpdate)
            .then(value => value.toJSON());
        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToUpdate);

        // remove some more data
        delete testDataToUpdate.messagingInformation;
        updatedListingItemTemplate1 = await listingItemTemplateService.update(createdListingItemTemplate3.id, testDataToUpdate)
            .then(value => value.toJSON());
        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToUpdate);

        // and even more
        delete testDataToUpdate.paymentInformation;
        updatedListingItemTemplate1 = await listingItemTemplateService.update(createdListingItemTemplate3.id, testDataToUpdate)
            .then(value => value.toJSON());
        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToUpdate);

        // and more
        delete testDataToUpdate.itemInformation;
        updatedListingItemTemplate1 = await listingItemTemplateService.update(createdListingItemTemplate3.id, testDataToUpdate)
            .then(value => value.toJSON());
        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToUpdate);

    }, 600000); // timeout to 600s
*/

/*
    test('Should not delete ListingItemTemplate having relation to ListingItem', async () => {
        expect.assertions(1);
        await listingItemTemplateService.destroy(createdListingItemTemplate3.id).catch(e =>
            expect(e).toEqual(new MessageException('ListingItemTemplate has ListingItems.'))
        );
    });
*/

    // TODO: rewrite this..
/*
    // searchBy tests
    test('Should generate 10 templates for searchBy tests', async () => {

        log.debug('createdListingItemTemplate2: ', createdListingItemTemplate2.id);
        log.debug('createdListingItemTemplate3: ', createdListingItemTemplate3.id);

        await listingItemTemplateService.destroy(createdListingItemTemplate2.id);
        await expectListingItemTemplateWasDeleted(createdListingItemTemplate2);

        log.debug('createdListingItem1: ', createdListingItemTemplate3.id);
        await listingItemService.destroy(createdListingItem1.id);
        await listingItemTemplateService.destroy(createdListingItemTemplate3.id);
        await expectListingItemTemplateWasDeleted(createdListingItemTemplate3);

        // expect to have no templates at this point
        const listingItemTemplates: resources.ListingItemTemplate[] = await listingItemTemplateService.findAll()
            .then(value => value.toJSON());
        expect(listingItemTemplates).toHaveLength(0);

        // then generate some
        generatedListingItemTemplates = await generateTemplatesAndListingItems(6, 4);
        expect(generatedListingItemTemplates).toHaveLength(10);

    }, 600000); // timeout to 600s


    test('Should return ListingItemTemplates having relation to ListingItem', async () => {
        const searchParams = {
            page: 0,
            pageLimit: 100,
            order: SearchOrder.ASC,
            orderField: SearchOrderField.DATE,
            profileId: defaultProfile.id,
            // searchString: '*',
            // category: '*',
            hasItems: true
        } as ListingItemTemplateSearchParams;

        const templates: resources.ListingItemTemplate[] = await listingItemTemplateService.search(searchParams)
            .then(value => value.toJSON());
        expect(templates.length).toBe(6);
        // log.debug('templates[0]:', JSON.stringify(templates[0], null, 2));
        expect(templates[0].updatedAt).toBeLessThan(templates[4].updatedAt);
    });

    test('Should return ListingItemTemplates not having relation to ListingItem', async () => {
        const searchParams = {
            page: 0,
            pageLimit: 100,
            order: SearchOrder.ASC,
            orderField: SearchOrderField.DATE,
            profileId: defaultProfile.id,
            // searchString: '*',
            // category: '*',
            hasItems: false
        } as ListingItemTemplateSearchParams;

        const templates: resources.ListingItemTemplate[] = await listingItemTemplateService.search(searchParams)
            .then(value => value.toJSON());
        expect(templates.length).toBe(4);
        expect(templates[0].updatedAt).toBeLessThan(templates[3].updatedAt);
    });

    test('Should return ListingItemTemplates not having relation to ListingItem, DATE descending order', async () => {
        const searchParams = {
            page: 0,
            pageLimit: 100,
            order: SearchOrder.DESC,
            orderField: SearchOrderField.DATE,
            profileId: defaultProfile.id,
            // searchString: '*',
            // category: '*',
            hasItems: false
        } as ListingItemTemplateSearchParams;

        const templates: resources.ListingItemTemplate[] = await listingItemTemplateService.search(searchParams)
            .then(value => value.toJSON());
        expect(templates.length).toBe(4);
        expect(templates[0].updatedAt).toBeGreaterThan(templates[3].updatedAt);
    });

    test('Should return ListingItemTemplates using searchString', async () => {
        const searchParams = {
            page: 0,
            pageLimit: 100,
            order: SearchOrder.ASC,
            orderField: SearchOrderField.DATE,
            profileId: defaultProfile.id,
            searchString: generatedListingItemTemplates[0].ItemInformation.title
            // category: '*',
            // hasItems: false
        } as ListingItemTemplateSearchParams;

        const templates: resources.ListingItemTemplate[] = await listingItemTemplateService.search(searchParams)
            .then(value => value.toJSON());
        expect(templates.length).toBe(1);

    });

    test('Should return ListingItemTemplates using searchString ordered correctly', async () => {
        const titleToSearchFor = 'titleToSearchFor';

        let testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic1));
        testDataToSave.profile_id = defaultProfile.id;
        testDataToSave.itemInformation.title = titleToSearchFor + ' 1';
        testDataToSave.generatedAt = +Date.now();
        await listingItemTemplateService.create(testDataToSave);

        testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic1));
        testDataToSave.profile_id = defaultProfile.id;
        testDataToSave.itemInformation.title = titleToSearchFor + ' 2';
        testDataToSave.generatedAt = +Date.now();
        await listingItemTemplateService.create(testDataToSave);

        let searchParams = {
            page: 0,
            pageLimit: 100,
            order: SearchOrder.ASC,
            orderField: SearchOrderField.TITLE,
            profileId: defaultProfile.id,
            searchString: titleToSearchFor
            // category: '*',
            // hasItems: false
        } as ListingItemTemplateSearchParams;

        let templates: resources.ListingItemTemplate[] = await listingItemTemplateService.search(searchParams).then(value => value.toJSON());
        expect(templates.length).toBe(2);
        expect(templates[0].ItemInformation.title).toBe(titleToSearchFor + ' 1');
        expect(templates[1].ItemInformation.title).toBe(titleToSearchFor + ' 2');

        searchParams = {
            page: 0,
            pageLimit: 100,
            order: SearchOrder.DESC,
            orderField: SearchOrderField.TITLE,
            profileId: defaultProfile.id,
            searchString: titleToSearchFor
            // category: '*',
            // hasItems: false
        } as ListingItemTemplateSearchParams;

        templates = await listingItemTemplateService.search(searchParams).then(value => value.toJSON());
        expect(templates.length).toBe(2);
        expect(templates[0].ItemInformation.title).toBe(titleToSearchFor + ' 2');
        expect(templates[1].ItemInformation.title).toBe(titleToSearchFor + ' 1');

    });
*/
});
