import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { ListingItemService } from '../../../src/api/services/ListingItemService';
import { MarketService } from '../../../src/api/services/MarketService';

import { UpdateListingItemMessageProcessor } from '../../../src/api/messageprocessors/UpdateListingItemMessageProcessor';
import { ListingItemMessage } from '../../../src/api/messages/ListingItemMessage';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { ListingItem } from '../../../src/api/models/ListingItem';
import { TestDataCreateRequest } from '../../../src/api/requests/TestDataCreateRequest';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Currency } from '../../../src/api/enums/Currency';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';
import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../../src/api/enums/MessagingProtocolType';
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
import { delete } from 'web-request';


describe('ListingItemMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let updateListingItemMessageProcessor: UpdateListingItemMessageProcessor;
    let marketService: MarketService;
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

    let createdListingItem;
    let updatedListingItem;
    let createdItemInformation;
    let createdPaymentInformation;
    let createdMessagingInformation;
    let defaultMarket;

    const messaging = [{ protocol: MessagingProtocolType.SMSG, public_key: 'publickey2' }];

    const testData = {
        hash: 'default-hash',
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
                region: 'South Africa', // TODO INVALID
                address: 'asdf, asdf, asdf',
                locationMarker: {
                    markerTitle: 'Helsinki',
                    markerText: 'Helsinki',
                    lat: 12.1234,
                    lng: 23.2314
                }
            },
            shippingDestinations: [{
                country: 'United Kingdom', // TODO INVALID
                shippingAvailability: ShippingAvailability.DOES_NOT_SHIP
            }, {
                country: 'Asia', // TODO INVALID
                shippingAvailability: ShippingAvailability.SHIPS
            }, {
                country: 'South Africa', // TODO INVALID
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
        objects: {}
    } as ListingItemMessage; // TODO:  no type

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app
        // tslint:disable:max-line-length
        updateListingItemMessageProcessor = app.IoC.getNamed<UpdateListingItemMessageProcessor>(Types.MessageProcessor, Targets.MessageProcessor.UpdateListingItemMessageProcessor);
        // tslint:enable:max-line-length
        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);

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

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

        defaultMarket = await marketService.getDefault();
        const result = await testDataService.create<ListingItem>({
            model: 'listingitem',
            data: {
                market_id: defaultMarket.Id,
                hash: ObjectHash.getHash(testData)
            } as any,
            withRelated: true
        } as TestDataCreateRequest);
        createdListingItem = result.toJSON();
        testData.hash = ObjectHash.getHash(testData);
    });

    afterAll(async () => {
        //
    });

    test('Should update Listing Item by ListingItemMessage', async () => {
        const testDataToUpdate = JSON.parse(JSON.stringify(testData));
        updatedListingItem = await updateListingItemMessageProcessor.process(testDataToUpdate as ListingItemMessage);
        const result = updatedListingItem.toJSON();
        createdItemInformation = result.ItemInformation;
        createdPaymentInformation = result.PaymentInformation;
        createdMessagingInformation = result.MessagingInformation[0];
        // test the values
        expect(result.id).toBe(createdListingItem.id);
        // ItemInformation
        expect(result.ItemInformation.title).toBe(testDataToUpdate.information.title);
        expect(result.ItemInformation.shortDescription).toBe(testDataToUpdate.information.shortDescription);
        expect(result.ItemInformation.longDescription).toBe(testDataToUpdate.information.longDescription);
        expect(result.ItemInformation.ItemCategory.name).toBe(testDataToUpdate.information.category[2]);
        expect(result.ItemInformation.ItemCategory.key).toBeNull();
        expect(result.ItemInformation.ItemCategory.parentItemCategoryId).not.toBeNull();

        // paymentInformation
        expect(result.PaymentInformation.type).toBe(testDataToUpdate.payment.type);
        expect(result.PaymentInformation.Escrow.type).toBe(testDataToUpdate.payment.escrow.type);
        const itemPrice = result.PaymentInformation.ItemPrice;
        expect(itemPrice.currency).toBe(testDataToUpdate.payment.itemPrice.currency);
        expect(itemPrice.basePrice).toBe(testDataToUpdate.payment.itemPrice.basePrice);

        // messaging-infomration
        expect(result.MessagingInformation[0].protocol).toBe(messaging[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(messaging[0].public_key);
    });

    test('Should delete the created listing items', async () => {
        // delete
        await listingItemService.destroy(createdListingItem.id);
        await listingItemService.findOne(createdListingItem.id).catch(e =>
            expect(e).toEqual(new NotFoundException(createdListingItem.id))
        );

        // item-information
        await itemInformationService.findOne(createdItemInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdItemInformation.id))
        );

        // item-location
        const itemLocationId = createdItemInformation.ItemLocation.id;
        await itemLocationService.findOne(itemLocationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemLocationId))
        );

        // location marker
        const locationMarkerId = createdItemInformation.ItemLocation.LocationMarker.id;
        await locationMarkerService.findOne(locationMarkerId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(locationMarkerId))
        );

        // shipping-destination
        const shipDestinationId = createdItemInformation.ShippingDestinations[0].id;
        await shippingDestinationService.findOne(shipDestinationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shipDestinationId))
        );

        // item image
        const itemImageId = createdItemInformation.ItemImages[0].id;
        await itemImageService.findOne(itemImageId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemImageId))
        );

        // paymentInformation
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // escrow
        const escrowId = createdPaymentInformation.Escrow.id;
        await escrowService.findOne(escrowId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(escrowId))
        );

        // escrow-ratio
        const escrowRatioId = createdPaymentInformation.Escrow.Ratio.id;
        await paymentInformationService.findOne(createdPaymentInformation.id, false).catch(e =>
            expect(e).toEqual(new NotFoundException(createdPaymentInformation.id))
        );

        // itemPrice
        const itemPriceId = createdPaymentInformation.ItemPrice.id;
        await itemPriceService.findOne(itemPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(itemPriceId))
        );

        // shippingPrice
        const shippingPriceId = createdPaymentInformation.ItemPrice.ShippingPrice.id;
        await paymentInformationService.findOne(shippingPriceId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(shippingPriceId))
        );

        // cryptoCurrencyAddress
        const cryptoCurrencyId = createdPaymentInformation.ItemPrice.CryptocurrencyAddress.id;
        await paymentInformationService.findOne(cryptoCurrencyId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(cryptoCurrencyId))
        );

        // messagingInformation
        const messagingInformationId = createdMessagingInformation.id;
        await messagingInformationService.findOne(messagingInformationId, false).catch(e =>
            expect(e).toEqual(new NotFoundException(messagingInformationId))
        );

    });


});
