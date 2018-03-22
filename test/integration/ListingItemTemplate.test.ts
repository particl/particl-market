import { app } from '../../src/app';
import { Logger as LoggerType } from '../../src/core/Logger';
import { Types, Core, Targets } from '../../src/constants';
import * as _ from 'lodash';

import { TestUtil } from './lib/TestUtil';

import { ValidationException } from '../../src/api/exceptions/ValidationException';
import { NotFoundException } from '../../src/api/exceptions/NotFoundException';
import { MessageException } from '../../src/api/exceptions/MessageException';

import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';
import { ListingItem } from '../../src/api/models/ListingItem';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';

import { ImageProcessing } from '../../src/core/helpers/ImageProcessing';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';

import { TestDataService } from '../../src/api/services/TestDataService';
import { ListingItemTemplateService } from '../../src/api/services/ListingItemTemplateService';
import { ProfileService } from '../../src/api/services/ProfileService';
import { ItemInformationService } from '../../src/api/services/ItemInformationService';
import { ItemLocationService } from '../../src/api/services/ItemLocationService';
import { LocationMarkerService } from '../../src/api/services/LocationMarkerService';
import { ShippingDestinationService } from '../../src/api/services/ShippingDestinationService';
import { ItemImageService } from '../../src/api/services/ItemImageService';
import { PaymentInformationService } from '../../src/api/services/PaymentInformationService';
import { EscrowService } from '../../src/api/services/EscrowService';
import { EscrowRatioService } from '../../src/api/services/EscrowRatioService';
import { ItemPriceService } from '../../src/api/services/ItemPriceService';
import { ShippingPriceService } from '../../src/api/services/ShippingPriceService';
import { CryptocurrencyAddressService } from '../../src/api/services/CryptocurrencyAddressService';
import { MessagingInformationService } from '../../src/api/services/MessagingInformationService';
import { ListingItemService } from '../../src/api/services/ListingItemService';
import { MarketService } from '../../src/api/services/MarketService';
import { ListingItemObjectService } from '../../src/api/services/ListingItemObjectService';

import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ListingItemTemplateUpdateRequest } from '../../src/api/requests/ListingItemTemplateUpdateRequest';
import { ListingItemCreateRequest } from '../../src/api/requests/ListingItemCreateRequest';
import { ListingItemObjectCreateRequest } from '../../src/api/requests/ListingItemObjectCreateRequest';
import { MessagingInformationCreateRequest } from '../../src/api/requests/MessagingInformationCreateRequest';
import { PaymentInformationCreateRequest } from '../../src/api/requests/PaymentInformationCreateRequest';
import { ItemInformationCreateRequest } from '../../src/api/requests/ItemInformationCreateRequest';

import * as listingItemCreateRequestBasic1 from '../testdata/createrequest/listingItemCreateRequestBasic1.json';
import * as listingItemCreateRequestBasic2 from '../testdata/createrequest/listingItemCreateRequestBasic2.json';
import * as listingItemUpdateRequestBasic1 from '../testdata/updaterequest/listingItemUpdateRequestBasic1.json';

import * as listingItemTemplateCreateRequestBasic1 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic1.json';
import * as listingItemTemplateCreateRequestBasic2 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic2.json';
import * as listingItemTemplateCreateRequestBasic3 from '../testdata/createrequest/listingItemTemplateCreateRequestBasic3.json';
import * as listingItemTemplateUpdateRequestBasic1 from '../testdata/updaterequest/listingItemTemplateUpdateRequestBasic1.json';

import * as resources from 'resources';

describe('ListingItemTemplate', () => {
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

    let createdListingItemTemplate1;
    let createdListingItemTemplate2;
    let createdListingItemTemplate3;
    let createdListingItem1;

    let updatedListingItemTemplate1;

    let defaultProfile;
    let defaultMarket;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app

        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);

        itemInformationService = app.IoC.getNamed<ItemInformationService>(Types.Service, Targets.Service.ItemInformationService);
        itemLocationService = app.IoC.getNamed<ItemLocationService>(Types.Service, Targets.Service.ItemLocationService);
        locationMarkerService = app.IoC.getNamed<LocationMarkerService>(Types.Service, Targets.Service.LocationMarkerService);
        shippingDestinationService = app.IoC.getNamed<ShippingDestinationService>(Types.Service, Targets.Service.ShippingDestinationService);
        itemImageService = app.IoC.getNamed<ItemImageService>(Types.Service, Targets.Service.ItemImageService);

        paymentInformationService = app.IoC.getNamed<PaymentInformationService>(Types.Service, Targets.Service.PaymentInformationService);
        escrowService = app.IoC.getNamed<EscrowService>(Types.Service, Targets.Service.EscrowService);
        escrowRatioService = app.IoC.getNamed<EscrowRatioService>(Types.Service, Targets.Service.EscrowRatioService);
        itemPriceService = app.IoC.getNamed<ItemPriceService>(Types.Service, Targets.Service.ItemPriceService);
        shippingPriceService = app.IoC.getNamed<ShippingPriceService>(Types.Service, Targets.Service.ShippingPriceService);
        cryptocurrencyAddressService = app.IoC.getNamed<CryptocurrencyAddressService>(Types.Service, Targets.Service.CryptocurrencyAddressService);

        messagingInformationService = app.IoC.getNamed<MessagingInformationService>(Types.Service, Targets.Service.MessagingInformationService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemObjectService = app.IoC.getNamed<ListingItemObjectService>(Types.Service, Targets.Service.ListingItemObjectService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

        defaultProfile = await profileService.getDefault();
        defaultMarket = await marketService.getDefault();
    });

    const expectListingItemTemplateFromCreateRequest = (result: resources.ListingItemTemplate, createRequest: ListingItemTemplateCreateRequest) => {
        expect(result.id).not.toBeNull();
        expect(result.hash).toBe(createRequest.hash);
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
        expect(result.hash).toBe(createRequest.hash);
        expect(result.Market.id).toBe(createRequest.market_id);

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
        expect(result.ItemLocation.region).toBe(createRequest.itemLocation.region);
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

    const expectMessagingInformationFromCreateRequest = (results: resources.MessagingInformation, createRequest: MessagingInformationCreateRequest) => {
        expect(results[0].protocol).toBe(createRequest[0].protocol);
        expect(results[0].publicKey).toBe(createRequest[0].publicKey);
    };

    const expectListingItemObjectsFromCreateRequest = (results: resources.ListingItemObjects, createRequest: ListingItemObjectCreateRequest) => {
        expect(results[0].type).toBe(createRequest[0].type);
        expect(results[0].description).toBe(createRequest[0].description);
        expect(results[0].order).toBe(createRequest[0].order);
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
                await listingItemObjectService.findOne(listintItemObjectId, false).catch(e =>
                    expect(e).toEqual(new NotFoundException(listintItemObjectId))
                );
            }
        }
    };

    // TODO: missing search tests

    // -------------------------------
    // TESTS
    // -------------------------------
    test('Should throw ValidationException because we want to create a empty listing item template', async () => {
        expect.assertions(1);
        await listingItemTemplateService.create({} as ListingItemTemplateCreateRequest).catch(e =>
            expect(e).toEqual(new ValidationException('Request body is not valid', []))
        );
    });

    test('Should create a new ListingItemTemplate', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic1));
        testDataToSave.hash = ObjectHash.getHash(testDataToSave);
        testDataToSave.profile_id = defaultProfile.Id;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        createdListingItemTemplate1 = listingItemTemplateModel.toJSON();

        expectListingItemTemplateFromCreateRequest(createdListingItemTemplate1, testDataToSave);
    });

    test('Should findAll ListingItemTemplates consisting of the previously created one', async () => {
        const listingItemTemplateCollection = await listingItemTemplateService.findAll();
        const listingItemTemplates = listingItemTemplateCollection.toJSON();
        const result = listingItemTemplates[0];

        expect(listingItemTemplates).toHaveLength(1);
        expect(result.hash).toBe(createdListingItemTemplate1.hash);
    });

    test('Should findOne ListingItemTemplate using id', async () => {
        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.findOne(createdListingItemTemplate1.id);
        const result = listingItemTemplateModel.toJSON();

        expect(result.hash).toBe(createdListingItemTemplate1.hash);
    });

    test('Should create a new ListingItemTemplate without ItemInformation, PaymentInformation, MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic2));

        // remove the stuff that we dont need in this test
        delete testDataToSave.itemInformation;
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        testDataToSave.hash = ObjectHash.getHash(testDataToSave);
        testDataToSave.profile_id = defaultProfile.Id;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        createdListingItemTemplate2 = listingItemTemplateModel.toJSON();

        expectListingItemTemplateFromCreateRequest(createdListingItemTemplate2, testDataToSave);
    });

    test('Should update previously created ListingItemTemplate', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateUpdateRequestBasic1));
        testDataToSave.hash = ObjectHash.getHash(testDataToSave);
        testDataToSave.profile_id = defaultProfile.Id;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.update(createdListingItemTemplate2.id, testDataToSave);
        updatedListingItemTemplate1 = listingItemTemplateModel.toJSON();

        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToSave);
    });

    test('Should delete the previously updated ListingItemTemplate', async () => {
        expect.assertions(16);
        await listingItemTemplateService.destroy(updatedListingItemTemplate1.id);
        await expectListingItemTemplateWasDeleted(updatedListingItemTemplate1);
    });

    test('Should create a new ListingItemTemplate without PaymentInformation, MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic2));

        // remove the stuff that we dont need in this test
        delete testDataToSave.paymentInformation;
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        testDataToSave.hash = ObjectHash.getHash(testDataToSave);
        testDataToSave.profile_id = defaultProfile.Id;

        // log.debug('testDataToSave:', JSON.stringify(testDataToSave, null, 2));

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        createdListingItemTemplate2 = listingItemTemplateModel.toJSON();

        expectListingItemTemplateFromCreateRequest(createdListingItemTemplate2, testDataToSave);
    });

    test('Should delete the ListingItemTemplate with ItemInformation', async () => {
        expect.assertions(6);
        await listingItemTemplateService.destroy(createdListingItemTemplate2.id);
        await expectListingItemTemplateWasDeleted(createdListingItemTemplate2);
    });

    test('Should create a new ListingItemTemplate without MessagingInformation and ListingItemObjects', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic2));

        // remove the stuff that we dont need in this test
        delete testDataToSave.messagingInformation;
        delete testDataToSave.listingItemObjects;

        testDataToSave.hash = ObjectHash.getHash(testDataToSave);
        testDataToSave.profile_id = defaultProfile.Id;

        const listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.create(testDataToSave);
        createdListingItemTemplate2 = listingItemTemplateModel.toJSON();

        expectListingItemTemplateFromCreateRequest(createdListingItemTemplate2, testDataToSave);
    });

    test('Should delete the ListingItemTemplate with ItemInformation and PaymentInformation', async () => {
        expect.assertions(11);
        await listingItemTemplateService.destroy(createdListingItemTemplate2.id);
        await expectListingItemTemplateWasDeleted(createdListingItemTemplate2);
    });

    test('Should create ListingItem with relation to ListingItemTemplate', async () => {
        const testDataToSave = JSON.parse(JSON.stringify(listingItemTemplateCreateRequestBasic3));
        testDataToSave.hash = ObjectHash.getHash(testDataToSave);

        // create ListingItemTemplate
        const listingItemTemplateCreateRequest = {
            profile_id: defaultProfile.Id,
            hash: testDataToSave.hash,
            itemInformation: testDataToSave.itemInformation,
            paymentInformation: testDataToSave.paymentInformation,
            messagingInformation: testDataToSave.messagingInformation,
            listingItemObjects: testDataToSave.listingItemObjects
        } as ListingItemTemplateCreateRequest;

        // log.debug('listingItemTemplateCreateRequest: ', JSON.stringify(listingItemTemplateCreateRequest, null, 2));
        const listingItemTemplate: ListingItemTemplate = await listingItemTemplateService.create(listingItemTemplateCreateRequest);
        createdListingItemTemplate3 = listingItemTemplate.toJSON();

        // create ListingItem with relation to ListingItemTemplate
        testDataToSave.listing_item_template_id = listingItemTemplate.Id;
        testDataToSave.market_id = defaultMarket.Id;

        const listingItemModel: ListingItem = await listingItemService.create(testDataToSave);
        createdListingItem1 = listingItemModel.toJSON();

        expectListingItemFromCreateRequest(createdListingItem1, testDataToSave);
        expect(createdListingItem1.ListingItemTemplate.id).toBe(listingItemTemplate.Id);
    });

    test('Should not delete ListingItemTemplate having relation to ListingItem', async () => {
        expect.assertions(1);
        await listingItemTemplateService.destroy(createdListingItemTemplate3.id).catch(e =>
            expect(e).toEqual(new MessageException('ListingItemTemplate has ListingItems.'))
        );
    });

    test('Should update ListingItemTemplate correctly when removing data', async () => {

        const testDataToUpdate = JSON.parse(JSON.stringify(listingItemTemplateUpdateRequestBasic1));
        testDataToUpdate.hash = ObjectHash.getHash(testDataToUpdate);
        testDataToUpdate.profile_id = defaultProfile.Id;

        // remove some data
        delete testDataToUpdate.listingItemObjects;
        let listingItemTemplateModel: ListingItemTemplate = await listingItemTemplateService.update(createdListingItemTemplate1.id, testDataToUpdate);
        updatedListingItemTemplate1 = listingItemTemplateModel.toJSON();
        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToUpdate);

        // remove some more data
        delete testDataToUpdate.messagingInformation;
        listingItemTemplateModel = await listingItemTemplateService.update(createdListingItemTemplate1.id, testDataToUpdate);
        updatedListingItemTemplate1 = listingItemTemplateModel.toJSON();
        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToUpdate);

        // and even more
        delete testDataToUpdate.paymentInformation;
        listingItemTemplateModel = await listingItemTemplateService.update(createdListingItemTemplate1.id, testDataToUpdate);
        updatedListingItemTemplate1 = listingItemTemplateModel.toJSON();
        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToUpdate);

        // and more
        delete testDataToUpdate.itemInformation;
        listingItemTemplateModel = await listingItemTemplateService.update(createdListingItemTemplate1.id, testDataToUpdate);
        updatedListingItemTemplate1 = listingItemTemplateModel.toJSON();
        expectListingItemTemplateFromCreateRequest(updatedListingItemTemplate1, testDataToUpdate);
    });

});
