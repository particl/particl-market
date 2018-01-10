import { rpc, api } from './lib/api';
import { Country } from '../../src/api/enums/Country';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ListingItemCreateRequest } from '../../src/api/requests/ListingItemCreateRequest';
import { Logger } from '../../src/core/Logger';
import { OwnListingItemSearchCommand } from '../../src/api/commands/listingitem/OwnListingItemSearchCommand';
import { MarketCreateCommand } from '../../src/api/commands/market/MarketCreateCommand';

describe('/OwnListingItemSearchCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const ListingItemService = null;
    const marketService = null;
    const method =  new OwnListingItemSearchCommand(ListingItemService, Logger).name;
    const addMakretMethod =  new MarketCreateCommand(marketService, Logger).name;

    const testData = {
        market_id: null,
        hash: 'hash1',
        itemInformation: {
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            itemCategory: {
                key: 'cat_high_luxyry_items'
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
        messagingInformation: [{
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey1'
        }]
    } as ListingItemCreateRequest;

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: 'itemhash',
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;
    const pageNumber = 1;
    const pageLimit = 2;
    let createdHash;
    let profileId;
    let createdTemplateId;
    let marketId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // get default profile
        const defaultProfile = await testUtil.getDefaultProfile();
        profileId = defaultProfile.id;

        // add market
        const resMarket = await rpc(addMakretMethod, ['Test Market', 'privateKey', 'Market Address']);
        marketId = resMarket.getBody()['result'].id;
        testData.market_id = marketId;

        testDataListingItemTemplate.profile_id = profileId;

        // create item template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate as ListingItemTemplateCreateRequest);
        createdTemplateId = addListingItemTempRes.getBody()['result'].id;
        testData['listing_item_template_id'] = createdTemplateId;

        // create listing item
        const addListingItemRes: any = await testUtil.addData('listingitem', testData as ListingItemCreateRequest);
        createdHash = addListingItemRes.getBody()['result'].hash;
    });

    test('Should get all own listing items by profile id', async () => {
        // get own items
        const addDataRes: any = await rpc(method, [pageNumber, pageLimit, 'ASC', profileId, '', '', true]);
        addDataRes.expectJson();
        addDataRes.expectStatusCode(200);
        const result: any = addDataRes.getBody()['result'];

        expect(result.length).toBe(1);
        expect(createdHash).toBe(result[0].hash);
        expect(createdTemplateId).toBe(result[0].listingItemTemplateId);
    });

    test('Should get emply own listing items, because invalid profile id ', async () => {
        const res: any = await rpc(method, [pageNumber, pageLimit, 'ASC', '', '', '', true]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);

    });

});



