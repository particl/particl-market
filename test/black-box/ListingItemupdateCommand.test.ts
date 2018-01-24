import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';

import { ListingItemCreateRequest } from '../../src/api/requests/ListingItemCreateRequest';
import { BidCreateRequest } from '../../src/api/requests/BidCreateRequest';

import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';

import { ListingItemUpdateCommand } from '../../src/api/commands/listingitem/ListingItemUpdateCommand';
import { MarketCreateCommand } from '../../src/api/commands/market/MarketCreateCommand';
import { ListingItemTemplate } from '../../src/api/models/ListingItemTemplate';

describe('ListingItemUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const listingItemService = null;
    const marketService = null;
    let listingItemTemplate;
    let listingItemHash;
    let listingItemId;
    let listingItem;

    const method = new ListingItemUpdateCommand(
        listingItemService,
        Logger).name;

    const addMakretMethod = new MarketCreateCommand(marketService, Logger).name;

    const testDataListingItem = {
        listing_item_template_id: 0,
        market_id: 0,
        hash: 'hash',
        itemInformation: {
            title: 'item title',
            shortDescription: 'item short desc',
            longDescription: 'item long desc',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
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
                country: 'US',
                shippingAvailability: ShippingAvailability.SHIPS
            }, {
                country: 'SA',
                shippingAvailability: ShippingAvailability.ASK
            }],
            itemImages: [{
                hash: 'imagehash',
                data: {
                    dataId: 'dataid',
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
            publicKey: 'publickey'
        }]
        // TODO: ignoring listingitemobjects for now
    } as ListingItemCreateRequest;

    beforeAll(async () => {
        await testUtil.cleanDb();
        // create market
        const resMarket = await rpc(addMakretMethod, ['Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = resMarket.getBody()['result'];
        testDataListingItem.market_id = resultMarket.id;

        // create listing-item-template
        const listingItemTemplateGenerateData = await testUtil.generateData('listingitemtemplate', 1);
        listingItemTemplate = listingItemTemplateGenerateData[0];

        // create listing item
        testDataListingItem.listing_item_template_id = listingItemTemplate.id;
        const addListingItem: any = await testUtil.addData('listingitem', testDataListingItem);
        listingItem = addListingItem.getBody()['result'];
        expect(listingItem).toBe(11);
        listingItemHash = listingItem.hash;
        listingItemId = listingItem.id;
    });

    test('Should update a listing-item by RPC', async () => {
        // to do :: Need to be discussed
    });

});
