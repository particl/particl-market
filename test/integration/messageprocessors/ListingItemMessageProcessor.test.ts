import { app } from '../../../src/app';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { Types, Core, Targets } from '../../../src/constants';
import { TestUtil } from '../lib/TestUtil';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { TestDataService } from '../../../src/api/services/TestDataService';
import { ListingItemService } from '../../../src/api/services/ListingItemService';

import { ListingItemMessageProcessor } from '../../../src/api/messageprocessors/ListingItemMessageProcessor';
import { ListingItemMessage } from '../../../src/api/messages/ListingItemMessage';
import { MarketService } from '../../../src/api/services/MarketService';
import { ObjectHash } from '../../../src/core/helpers/ObjectHash';
import { ListingItemTemplateService } from '../../../src/api/services/ListingItemTemplateService';
import { ProfileService } from '../../../src/api/services/ProfileService';
import { ListingItemTemplate } from '../../../src/api/models/ListingItemTemplate';
import { TestDataCreateRequest } from '../../../src/api/requests/TestDataCreateRequest';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Currency } from '../../../src/api/enums/Currency';
import { Country } from '../../../src/api/enums/Country';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';
import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../../src/api/enums/MessagingProtocolType';

describe('ListingItemMessageProcessor', () => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new TestUtil();

    let testDataService: TestDataService;
    let listingItemMessageProcessor: ListingItemMessageProcessor;
    let listingItemService: ListingItemService;
    let marketService: MarketService;
    let listingItemTemplateService: ListingItemTemplateService;
    let profileService: ProfileService;
    let createdListingItem;
    let createdListingItemTwo;
    let defaultMarket;
    let defaultProfile;
    let createdListingItemTemplate;

    const messaging = [{ protocol: 'SMSG', public_key: 'publickey2' }];

    const testData = {
        marketId: null,
        listingItemTemplateId: null,
        hash: '',
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
        messaging
    };

    beforeAll(async () => {
        await testUtil.bootstrapAppContainer(app);  // bootstrap the app
        testDataService = app.IoC.getNamed<TestDataService>(Types.Service, Targets.Service.TestDataService);
        listingItemService = app.IoC.getNamed<ListingItemService>(Types.Service, Targets.Service.ListingItemService);
        listingItemMessageProcessor = app.IoC.getNamed<ListingItemMessageProcessor>(Types.MessageProcessor,
            Targets.MessageProcessor.ListingItemMessageProcessor);
        marketService = app.IoC.getNamed<MarketService>(Types.Service, Targets.Service.MarketService);
        listingItemTemplateService = app.IoC.getNamed<ListingItemTemplateService>(Types.Service, Targets.Service.ListingItemTemplateService);
        profileService = app.IoC.getNamed<ProfileService>(Types.Service, Targets.Service.ProfileService);

        // clean up the db, first removes all data and then seeds the db with default data
        await testDataService.clean([]);

        // get default market
        defaultMarket = await marketService.getDefault();

        defaultProfile = await profileService.getDefault();
        createdListingItemTemplate = await testDataService.create<ListingItemTemplate>({
            model: 'listingitemtemplate',
            data: {
                profile_id: defaultProfile.Id,
                hash: 'itemhash'
            } as any,
            withRelated: true
        } as TestDataCreateRequest);
    });

    afterAll(async () => {
        //
    });

    test('Should create a new Listing Item by ListingItemMessage', async () => {
        // set market id
        testData.marketId = defaultMarket.id;
        testData.hash = ObjectHash.getHash(testData);

        createdListingItem = await listingItemMessageProcessor.process(testData as ListingItemMessage);
        const result = createdListingItem.toJSON();

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

        // messaging-infomration
        expect(result.MessagingInformation[0].protocol).toBe(messaging[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(messaging[0].public_key);
    });

    test('Should create a new Listing Item by ListingItemMessage with listingItemItemplateId', async () => {

        testData.messaging = messaging;
        testData.listingItemTemplateId = createdListingItemTemplate.id;
        testData.hash = ObjectHash.getHash(testData);
        createdListingItem = await listingItemMessageProcessor.process(testData as ListingItemMessage);
        const result = createdListingItem.toJSON();

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

        // messaging-infomration
        expect(result.MessagingInformation[0].protocol).toBe(messaging[0].protocol);
        expect(result.MessagingInformation[0].publicKey).toBe(messaging[0].public_key);
    });

    test('Should create a Listing without messaging information', async () => {
        // delete messaging
        delete testData.messaging;
        testData.hash = ObjectHash.getHash(testData);
        createdListingItemTwo = await listingItemMessageProcessor.process(testData as ListingItemMessage);
        const result = createdListingItemTwo.toJSON();
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
    });


    test('Should delete the created listing items', async () => {
     // delete the both created listing items
     await listingItemService.destroy(createdListingItem.id);
     await listingItemService.findOne(createdListingItem.id).catch(e =>
        expect(e).toEqual(new NotFoundException(createdListingItem.id))
      );

     await listingItemService.destroy(createdListingItemTwo.id);
     await listingItemService.findOne(createdListingItemTwo.id).catch(e =>
        expect(e).toEqual(new NotFoundException(createdListingItemTwo.id))
      );
  });

});
