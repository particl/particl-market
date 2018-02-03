import { rpc, api } from './lib/api';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { ShippingCountries } from '../../src/core/helpers/ShippingCountries';
import * as countryList from 'iso3166-2-db/countryList/en.json';
import { JsonRpc2Response} from '../../src/core/api/jsonrpc';
import { ListingItem, ListingItemTemplate } from 'resources';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
/**
 * shipping destination can be removed using following params:
 * [0]: shippingDestinationId
 * or
 * [0]: listing_item_template_id
 * [1]: country/countryCode
 * [2]: shipping availability (ShippingAvailability enum)
 *
 * TODO: why do we have shipping availability there? if user wants to remove the shipping destinations availability,
 * then shouldn't templateid + country code be enough information to remove that? there's always only one availability
 * for one country, you can't ship and not_ship at the same time.
 *
 */
describe('ShippingDestinationRemoveCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.TEMPLATE_ROOT.commandName;
    const subCommands = [Commands.SHIPPINGDESTINATION_ROOT.commandName, Commands.SHIPPINGDESTINATION_REMOVE.commandName] as any[];

    let createdListingItemTemplateId;
    let createdShippingDestinationId;
    let shippingDestinationId;
    // let createdListingItemId;
    let createdListingItemsShippingDestinationId;
    let listingItemId;

    const testData = {
        profile_id: 0,
        hash: 'hash1',
        itemInformation: {
            listing_item_id: null,
            title: 'item title1',
            shortDescription: 'item short desc1',
            longDescription: 'item long desc1',
            itemCategory: {
                key: 'cat_high_luxyry_items'
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

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            false,  // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create template without shipping destinations and store its id for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                                  // how many to generate
            true,                               // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItemTemplate[];
        // createdListingItemTemplateId = listingItems[0].id;
        listingItemId = listingItems[0].id;

        // we are shipping to south africa
        // get default profile
        const defaultProfile = await testUtil.getDefaultProfile();
        testData.profile_id = defaultProfile.id;
        // testData.itemInformation.listing_item_id = itemId;
        // set listingItem id

        const listingItemTem: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testData);

        createdListingItemTemplateId = listingItemTem.id;
        createdListingItemsShippingDestinationId = listingItems[0].ItemInformation.ShippingDestinations[0].id;

        const addShippingSubCommands = [Commands.SHIPPINGDESTINATION_ROOT.commandName, Commands.SHIPPINGDESTINATION_ADD.commandName] as any[];
        const addShippingResult = await rpc(method, addShippingSubCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]));
        createdShippingDestinationId = addShippingResult.getBody<JsonRpc2Response>().result.id;
    });

    // TODO: missing tests that delete using shipping destination id

    test('Should fail to remove shipping destination using invalid country', async () => {

        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, 'invalid-country-code', ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        // expect(removeShippingResult.error.error.message).toBe('Country or shipping availability was not valid!');
        expect(removeShippingResult.error.error.message).toBe('Entity with identifier Country code <INVALID-COUNTRY-CODE> was not valid! does not exist');
    });

    test('Should fail to remove shipping destination using invalid ShippingAvailability', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.DOES_NOT_SHIP]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        // expect(removeShippingResult.error.error.message).toBe('Country or shipping availability was not valid!');
        expect(removeShippingResult.error.error.message).toBe('Entity with identifier ' + createdListingItemTemplateId + ' does not exist');
    });

    test('Should fail to remove shipping destination for invalid itemtemplate id', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId + 100, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        expect(removeShippingResult.error.error.message).toBe('Entity with identifier ' + (createdListingItemTemplateId + 100) + ' does not exist');
    });

    test('Should remove shipping destination', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(200);
    });

    test('Should fail remove shipping destination because it already removed', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
    });

    test('Should fail to remove shipping destination from listing item (listing items have allready been posted)', async () => {

        testData.itemInformation.listing_item_id = listingItemId;
        // set listingItem id
        testData.hash = ObjectHash.getHash(testData);
        const listingItemTem: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testData);

        createdListingItemTemplateId = listingItemTem.id;

        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [createdListingItemTemplateId, countryList.ZA.iso, ShippingAvailability.SHIPS]
        ));
        shippingDestinationId = listingItemTem.ItemInformation.ShippingDestinations[0].id;

        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(404);
        expect(removeShippingResult.error.error.success).toBe(false);
        expect(removeShippingResult.error.error.message).toBe('Can\'t delete shipping destination because the item has allready been posted!');
    });

    test('Should remove shipping destination by id', async () => {
        const removeShippingResult: any = await rpc(method, subCommands.concat(
            [shippingDestinationId]
        ));
        removeShippingResult.expectJson();
        removeShippingResult.expectStatusCode(200);
    });

});



