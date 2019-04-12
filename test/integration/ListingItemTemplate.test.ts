// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import * as _ from 'lodash';
import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import { TestUtil } from './lib/TestUtil';
import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { MessageException } from '../../src/api/exceptions/MessageException';
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
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ListingItemObjectCreateRequest } from '../../src/api/requests/ListingItemObjectCreateRequest';
import { MessagingInformationCreateRequest } from '../../src/api/requests/MessagingInformationCreateRequest';
import { PaymentInformationCreateRequest } from '../../src/api/requests/PaymentInformationCreateRequest';
import { ItemInformationCreateRequest } from '../../src/api/requests/ItemInformationCreateRequest';
import * as listingItemTemplateCreateRequestBasic1 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic1.json';
import * as listingItemTemplateCreateRequestBasic2 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic2.json';
import * as listingItemTemplateCreateRequestBasic3 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic3.json';
import * as listingItemTemplateUpdateRequestBasic1 from '../testdata/updaterequest/listingItemTemplateUpdateRequestBasic1.json';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { TestDataGenerateRequest } from '../../src/api/requests/TestDataGenerateRequest';
import { ListingItemTemplateSearchParams } from '../../src/api/requests/ListingItemTemplateSearchParams';
import { SearchOrder } from '../../src/api/enums/SearchOrder';
import { SearchOrderField } from '../../src/api/enums/SearchOrderField';
import { ObjectHashDeprecated } from '../../src/api/messages/hashable/ObjectHashDeprecated';
import { HashableObjectTypeDeprecated } from '../../src/api/enums/HashableObjectTypeDeprecated';

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

    let createdListingItemTemplate1: resources.ListingItemTemplate;
    let createdListingItemTemplate2: resources.ListingItemTemplate;
    let createdListingItemTemplate3: resources.ListingItemTemplate;
    let createdListingItem1: resources.ListingItem;

    let updatedListingItemTemplate1: resources.ListingItemTemplate;

    let generatedListingItemTemplates: resources.ListingItemTemplate[]; // for searchBy tests

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

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

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault().then(value => value.toJSON());
        defaultMarket = await marketService.getDefault().then(value => value.toJSON());

    });

    const expectListingItemTemplateFromCreateRequest = (result: resources.ListingItemTemplate, createRequest: ListingItemTemplateCreateRequest) => {
        expect(result.id).not.toBeNull();
        expect(result.hash).not.toBeNull();
        expect(result.Profile.id).toBe(createRequest.profile_id);

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
        expect(result.ItemCategory.name).toBe(createRequest.itemCategory.name);
        expect(result.ItemCategory.description).toBe(createRequest.itemCategory.description);
        expect(result.ItemLocation.country).toBe(createRequest.itemLocation.country);
        expect(result.ItemLocation.address).toBe(createRequest.itemLocation.address);
        expect(result.ItemLocation.LocationMarker.markerTitle).toBe(createRequest.itemLocation.locationMarker.markerTitle);
        expect(result.ItemLocation.LocationMarker.markerText).toBe(createRequest.itemLocation.locationMarker.markerText);
        expect(result.ItemLocation.LocationMarker.lat).toBe(createRequest.itemLocation.locationMarker.lat);
        expect(result.ItemLocation.LocationMarker.lng).toBe(createRequest.itemLocation.locationMarker.lng);
        expect(result.ShippingDestinations).toHaveLength(createRequest.shippingDestinations.length);
        expect(result.ItemImages).toHaveLength(createRequest.itemImages.length);
        expect(result.ItemImages[0].ItemImageDatas).toHaveLength(4); // 4 sizes
    };

    const expectPaymentInformationFromCreateRequest = (result: resources.PaymentInformation, createRequest: PaymentInformationCreateRequest) => {
        expect(result.type).toBe(createRequest.type);
        expect(result.Escrow.type).toBe(createRequest.escrow.type);
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
        await listingItemTemplateService.findOne(item.id).catch(e =>
            expect(e).toEqual(new NotFoundException(item.id))
        );

        // ItemInformation
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
            for (const messagingInformation of item.MessagingInformation) {
                const messagingInformationId = messagingInformation.id;
                await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
                    expect(e).toEqual(new NotFoundException(messagingInformationId))
                );
            }
        }

        // ListingItemObjects
        if (!_.isEmpty(item.ListingItemObjects)) {
            for (const listingItemObject of item.ListingItemObjects) {
                const listintItemObjectId = listingItemObject.id;
                // ListingItemObjectDatas
                const listintItemObjectDatas = listingItemObject.ListingItemObjectDatas;
                if (!_.isEmpty(listintItemObjectDatas)) {
                    for (const listintItemObjectData of listintItemObjectDatas) {
                        await listingItemObjectDataService.findOne(listintItemObjectData.id, false).catch(e =>
                            expect(e).toEqual(new NotFoundException(listintItemObjectData.id))
                        );
                    }
                }
                await listingItemObjectService.findOne(listintItemObjectId, false).catch(e =>
                    expect(e).toEqual(new NotFoundException(listintItemObjectId))
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
            defaultProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
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
            expect(generatedListingItemTemplate.Profile.id).toBe(defaultProfile.id);

            if (generatedListingItemTemplate.ListingItems && generatedListingItemTemplate.ListingItems.length > 0 ) {
                // expect to find the listingItem with relation to the template
                const generatedListingItemModel = await listingItemService.findOne(generatedListingItemTemplate.ListingItems[0].id);
                const generatedListingItem = generatedListingItemModel.toJSON();
                expect(generatedListingItemTemplate.id).toBe(generatedListingItem.ListingItemTemplate.id);

                // expect the listingitem to be posted to the correct market
                expect(generatedListingItemTemplate.ListingItems[0].marketId).toBe(defaultMarket.id);

                // expect the item hash generated at the same time as template, matches with the templates one
                // log.debug('generatedListingItemTemplate.hash:', generatedListingItemTemplate.hash);
                // log.debug('generatedListingItemTemplate.ListingItems[0].hash:', generatedListingItemTemplate.ListingItems[0].hash);
                expect(generatedListingItemTemplate.hash).toBe(generatedListingItemTemplate.ListingItems[0].hash);
            }

            // expect template hash created on the server matches what we create here
            const generatedTemplateHash = ObjectHashDeprecated.getHash(generatedListingItemTemplate, HashableObjectTypeDeprecated.LISTINGITEMTEMPLATE);
            // log.debug('generatedListingItemTemplate.hash:', generatedListingItemTemplate.hash);
            // log.debug('generatedTemplateHash:', generatedTemplateHash);
            expect(generatedListingItemTemplate.hash).toBe(generatedTemplateHash);

        }

        return generatedTemplates;
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
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic1));
        testDataToSave.profile_id = defaultProfile.id;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));
        createdListingItemTemplate1 = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(createdListingItemTemplate1, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should findAll ListingItemTemplates containing the previously created one', async () => {
        const listingItemTemplates: resources.ListingItemTemplate = await listingItemTemplateService.findAll()
            .then(value => value.toJSON());
        const result = listingItemTemplates[0];

        expect(listingItemTemplates).toHaveLength(1);
        expect(result.hash).toBe(createdListingItemTemplate1.hash);
    });

    test('Should findOne ListingItemTemplate using id', async () => {
        const result: resources.ListingItemTemplate = await listingItemTemplateService.findOne(createdListingItemTemplate1.id)
            .then(value => value.toJSON());

        expect(result.hash).toBe(createdListingItemTemplate1.hash);
    });

    test('Should create a new ListingItemTemplate without ItemInformation, PaymentInformation, MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic2));

        // remove the stuff that we dont need in this test
        delete testDataToSave.itemInformation;
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        testDataToSave.profile_id = defaultProfile.id;

        createdListingItemTemplate2 = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(createdListingItemTemplate2, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should create a third ListingItemTemplate without ItemInformation, PaymentInformation, MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic2));

        // remove the stuff that we dont need in this test
        delete testDataToSave.itemInformation;
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        testDataToSave.profile_id = defaultProfile.id;

        createdListingItemTemplate3 = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(createdListingItemTemplate3, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should update previously created ListingItemTemplate', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateUpdateRequestBasic1));
        testDataToSave.profile_id = defaultProfile.id;

        updatedListingItemTemplate1 = await listingItemTemplateService.update(createdListingItemTemplate3.id, testDataToSave)
            .then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should delete the previously updated ListingItemTemplate', async () => {
        expect.assertions(21);
        await listingItemTemplateService.destroy(updatedListingItemTemplate1.id);
        await expectListingItemTemplateWasDeleted(updatedListingItemTemplate1);
    });

    test('Should create a new ListingItemTemplate without PaymentInformation, MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic2));

        // remove the stuff that we dont need in this test
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        testDataToSave.profile_id = defaultProfile.id;

        createdListingItemTemplate3 = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(createdListingItemTemplate3, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should delete the ListingItemTemplate with ItemInformation', async () => {
        expect.assertions(6);
        await listingItemTemplateService.destroy(createdListingItemTemplate3.id);
        await expectListingItemTemplateWasDeleted(createdListingItemTemplate3);
    });

    test('Should create a new ListingItemTemplate without MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic2));

        // remove the stuff that we dont need in this test
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        testDataToSave.profile_id = defaultProfile.id;

        createdListingItemTemplate3 = await listingItemTemplateService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemTemplateFromCreateRequest(createdListingItemTemplate3, testDataToSave);
    }, 600000); // timeout to 600s

    test('Should delete the ListingItemTemplate with ItemInformation and PaymentInformation', async () => {
        expect.assertions(11);
        await listingItemTemplateService.destroy(createdListingItemTemplate3.id);
        await expectListingItemTemplateWasDeleted(createdListingItemTemplate3);
    });

    test('Should create ListingItemTemplate with relation to ListingItem', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic3));

        log.debug('Should create ListingItemTemplate with relation to ListingItem');

        // create ListingItemTemplate
        const listingItemTemplateCreateRequest = {
            profile_id: defaultProfile.id,
            itemInformation: testDataToSave.itemInformation,
            paymentInformation: testDataToSave.paymentInformation,
            messagingInformation: testDataToSave.messagingInformation,
            listingItemObjects: testDataToSave.listingItemObjects
        } as ListingItemTemplateCreateRequest;

        // log.debug('listingItemTemplateCreateRequest: ', JSON.stringify(listingItemTemplateCreateRequest, null, 2));
        createdListingItemTemplate3 = await listingItemTemplateService.create(listingItemTemplateCreateRequest).then(value => value.toJSON());

        // create ListingItem with relation to ListingItemTemplate
        testDataToSave.listing_item_template_id = createdListingItemTemplate3.id;
        testDataToSave.market_id = defaultMarket.id;
        testDataToSave.seller = defaultProfile.address;
        testDataToSave.expiryTime = 4;
        testDataToSave.postedAt = new Date().getTime();
        testDataToSave.expiredAt = new Date().getTime();
        testDataToSave.receivedAt = new Date().getTime();
        testDataToSave.generatedAt = new Date().getTime();

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        createdListingItem1 = await listingItemService.create(testDataToSave).then(value => value.toJSON());

        expectListingItemFromCreateRequest(createdListingItem1, testDataToSave as ListingItemTemplateCreateRequest);
        expect(createdListingItem1.ListingItemTemplate.id).toBe(createdListingItemTemplate3.id);
    }, 600000); // timeout to 600s

    test('Should not delete ListingItemTemplate having relation to ListingItem', async () => {
        expect.assertions(1);
        await listingItemTemplateService.destroy(createdListingItemTemplate3.id).catch(e =>
            expect(e).toEqual(new MessageException('ListingItemTemplate has ListingItems.'))
        );
    });

    test('Should update ListingItemTemplate correctly when removing data', async () => {

        const testDataToUpdate = JSON.parse(JSON.stringify(listingItemTemplateUpdateRequestBasic1));

        testDataToUpdate.profile_id = defaultProfile.id;

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

        // delete related ListingItem
        await listingItemService.destroy(updatedListingItemTemplate1.ListingItems[0].id);

        // finally delete the template
        await listingItemTemplateService.destroy(updatedListingItemTemplate1.id);
        await expectListingItemTemplateWasDeleted(updatedListingItemTemplate1);

    }, 600000); // timeout to 600s


    // searchBy tests
    test('Should generate 10 templates for searchBy tests', async () => {
        await listingItemTemplateService.destroy(createdListingItemTemplate1.id);
        await expectListingItemTemplateWasDeleted(createdListingItemTemplate1);
        await listingItemTemplateService.destroy(createdListingItemTemplate2.id);
        await expectListingItemTemplateWasDeleted(createdListingItemTemplate2);

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
        await listingItemTemplateService.create(testDataToSave);

        testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic1));
        testDataToSave.profile_id = defaultProfile.id;
        testDataToSave.itemInformation.title = titleToSearchFor + ' 2';
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
});
