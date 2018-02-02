import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ListingItemCreateRequest } from '../../src/api/requests/ListingItemCreateRequest';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('ListingItemUpdateCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    let listingItemTemplate;
    let listingItemHash;
    let listingItemId;
    let listingItem;

    const method = Commands.ITEM_ROOT.commandName;
    const subCommand = Commands.ITEM_POST_UPDATE.commandName;

    const makretRootMethod = Commands.MARKET_ROOT.commandName;
    const addMakretMethod = Commands.MARKET_ADD.commandName;

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

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // create market
        const resMarket = await rpc(makretRootMethod, [addMakretMethod, 'Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = resMarket.getBody()['result'];
        testDataListingItem.market_id = resultMarket.id;

        // generate listing-item-template
        const listingItemTemplateGenerateData = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];

        listingItemTemplate = listingItemTemplateGenerateData[0];

        // create listing item
        testDataListingItem.listing_item_template_id = listingItemTemplate.id;
        const addListingItem: any = await testUtil.addData(CreatableModel.LISTINGITEM, testDataListingItem);
        listingItem = addListingItem;
        listingItemHash = listingItem.hash;
        listingItemId = listingItem.id;
    });

    test('Should update a listing-item by RPC', async () => {
        // to do :: Need to be discussed
    });

});
