import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { ListingItemService } from '../../../src/api/services/ListingItemService';

import { ListingItemMessageProcessor } from '../../../src/api/messageprocessors/ListingItemMessageProcessor';
import { ListingItemMessage } from '../../../src/api/messages/ListingItemMessage';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { TestDataCreateRequest } from '../../../src/api/requests/TestDataCreateRequest';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Currency } from '../../../src/api/enums/Currency';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';
import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../../src/api/enums/MessagingProtocolType';
import { ListingItemObjectType } from '../../../src/api/enums/ListingItemObjectType';
import { ImageProcessing } from '../../../src/core/helpers/ImageProcessing';

import { ItemInformationService } from '../../../src/api/services/ItemInformationService';
import { ItemLocationService } from '../../../src/api/services/ItemLocationService';
import { LocationMarkerService } from '../../../src/api/services/LocationMarkerService';
import { ShippingDestinationService } from '../../../src/api/services/ShippingDestinationService';
import { ItemImageService } from '../../../src/api/services/ItemImageService';

import { PaymentInformationService } from '../../../src/api/services/PaymentInformationService';
import { EscrowService } from '../../../src/api/services/EscrowService';
import { EscrowRatioService } from '../../../src/api/services/EscrowRatioService';
import { ItemPriceService } from '../../../src/api/services/ItemPriceService';
import { ShippingPriceService } from '../../../src/api/services/ShippingPriceService';
import { CryptocurrencyAddressService } from '../../../src/api/services/CryptocurrencyAddressService';
import { MessagingInformationService } from '../../../src/api/services/MessagingInformationService';
import { ListingItemObjectService } from '../../../src/api/services/ListingItemObjectService';


describe('ListingItemMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemMessageProcessor: ListingItemMessageProcessor;
    let listingItemService: ListingItemService;

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
    let listingItemObjectService: ListingItemObjectService;

    let createdListingItem;
    let createdItemInformation;
    let createdPaymentInformation;
    let createdMessagingInformation;
    let createtListingItemObject;

    let createdListingItemTwo;
    let createdItemInformation2;
    let createdPaymentInformation2;
    let createdMessagingInformation2;
    let createtListingItemObject2;

    const messaging = [{ protocol: MessagingProtocolType.SMSG, public_key: 'publickey2' }];
    const objects = [{
        type: ListingItemObjectType.CHECKBOX,
        description: 'Test Description',
        order: 1
    }];

    const testData = {
        hash: '123132',
        information: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            category: [
                'cat_ROOT',
                'Subcategory',
                'Subsubcategory'
            ],
            itemLocation: {
                region: 'CA',
                address: 'asdf, asdf, asdf',
                locationMarker: {
                    markerTitle: 'Helsinki',
                    markerText: 'Helsinki',
                    lat: 12.1234,
                    lng: 23.2314
                }
            },
            shippingDestinations: [{
                country: 'UK',
                shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
            }, {
                country: 'EU',
                shippingAvailability: ShippingAvailability.SHIPS
            }, {
                country: 'CA',
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
        payment: {
            type: PaymentType.SALE,
            escrow: {
                type: EscrowType.MAD,
                ratio: {
                    buyer: 100,
                    seller: 100
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
        messaging,
        objects
    } as ListingItemMessage;

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app
        // tslint:disable:max-line-length
        listingItemMessageProcessor = app.IoC.getNamed<ListingItemMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.ListingItemMessageProcessor);
        // tslint:enable:max-line-length
        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);

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
        listingItemObjectService = app.IoC.getNamed<ListingItemObjectService>(Types.Service, Targets.Service.ListingItemObjectService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean();

    });

    afterAll(async () => {
        //
    });

    test('Should create a new Listing Item by ListingItemMessage', async () => {
        testData.hash = ObjectHash.getHash(testData);

        createdListingItem = await listingItemMessageProcessor.process(testData as ListingItemMessage);
        const result = createdListingItem.toJSON();
        createdItemInformation = result.ItemInformation;
        createdPaymentInformation = result.PaymentInformation;
        createdMessagingInformation = result.MessagingInformation;
        createtListingItemObject = result.ListingItemObjects;
        // test the values
        expect(result.id).not.toBeNull();
        // ItemInformation
        expect(result.ItemInformation.title).toBe(testData.information.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.information.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.information.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.information.category[2]);
        expect(result.ItemInformation.ItemCategory.key).toBeNull();
        expect(result.ItemInformation.ItemCategory.parentItemCategoryId).not.toBeNull();

        // paymentInformation
        expect(result.PaymentInformation.type).toBe(testData.payment.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.payment.escrow.type);
        const itemPrice = result.PaymentInformation.ItemPrice;
        expect(itemPrice.currency).toBe(testData.payment.itemPrice.currency);
        expect(itemPrice.basePrice).toBe(testData.payment.itemPrice.basePrice);

        // messaging-infomration
        expect(result.MessagingInformation[0].protocol).toBe(messaging[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(messaging[0].public_key);

        // listingitem-object
        expect(result.ListingItemObjects[0].type).toBe(objects[0].type);
        expect(result.ListingItemObjects[0].description).toBe(objects[0].description);
        expect(result.ListingItemObjects[0].order).toBe(objects[0].order);
    });

    test('Should create a Listing without messaging information', async () => {
        // delete messaging
        delete testData.messaging;
        testData.hash = ObjectHash.getHash(testData);
        createdListingItemTwo = await listingItemMessageProcessor.process(testData as ListingItemMessage);
        const result = createdListingItemTwo.toJSON();
        createdItemInformation2 = result.ItemInformation;
        createdPaymentInformation2 = result.PaymentInformation;
        createdMessagingInformation2 = result.MessagingInformation;
        createtListingItemObject2 = result.ListingItemObjects;

        // test the values
        expect(result.id).not.toBeNull();
        // ItemInformation
        expect(result.ItemInformation.title).toBe(testData.information.title);
        expect(result.ItemInformation.shortDescription).toBe(testData.information.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testData.information.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testData.information.category[2]);

        // paymentInformation
        expect(result.PaymentInformation.type).toBe(testData.payment.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testData.payment.escrow.type);
        const itemPrice = result.PaymentInformation.ItemPrice;
        expect(itemPrice.currency).toBe(testData.payment.itemPrice.currency);
        expect(itemPrice.basePrice).toBe(testData.payment.itemPrice.basePrice);

        // listingitem-object
        expect(result.ListingItemObjects[0].type).toBe(objects[0].type);
        expect(result.ListingItemObjects[0].description).toBe(objects[0].description);
        expect(result.ListingItemObjects[0].order).toBe(objects[0].order);
    });


    test('Should delete the created listing items', async () => {
        // delete the both created listing items
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        let itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        let locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        let shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        let itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // escrow
        let escrowId = createdPaymentInformation.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        let escrowRatioId = createdPaymentInformation.Escrow.Ratio.id;
        await escrowRatioService.findOne(escrowRatioId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowRatioId))
        );

        // itemPrice
        let itemPriceId = createdPaymentInformation.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        let shippingPriceId = createdPaymentInformation.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        let cryptoCurrencyId = createdPaymentInformation.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

        // messagingInformation
        const messagingInformationId = createdMessagingInformation[0].id;
        await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(messagingInformationId))
        );

        // listingitemObject
        let listingItemObjectsId = createtListingItemObject[0].id;
        await listingItemObjectService.findOne(listingItemObjectsId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemObjectsId))
        );

        // remove 2nd
        await listingItemService.destroy(createdListingItemTwo.id);
        await listingItemService.findOne(createdListingItemTwo.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItemTwo.id))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation2.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation2.id))
        );

        // item-location
        itemLocationId = createdItemInformation2.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        locationMarkerId = createdItemInformation2.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        shipDestinationId = createdItemInformation2.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        itemImageId = createdItemInformation2.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation2.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation2.id))
        );

        // escrow
        escrowId = createdPaymentInformation2.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        escrowRatioId = createdPaymentInformation2.Escrow.Ratio.id;
        await escrowRatioService.findOne(createdPaymentInformation2.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation2.id))
        );

        // itemPrice
        itemPriceId = createdPaymentInformation2.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        shippingPriceId = createdPaymentInformation2.ItemPrice.ShippingPrice.id;
        await shippingPriceService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        cryptoCurrencyId = createdPaymentInformation2.ItemPrice.CryptocurrencyAddress.id;
        await cryptocurrencyAddressService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

        // listingitemObject
        listingItemObjectsId = createtListingItemObject2[0].id;
        await listingItemObjectService.findOne(listingItemObjectsId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(listingItemObjectsId))
        );
    });

});
