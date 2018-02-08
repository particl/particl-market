import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { Currency } from '../../../src/api/enums/Currency';
import { ShippingAvailability } from '../../../src/api/enums/ShippingAvailability';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';

import { CryptocurrencyAddressType } from '../../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../../src/api/enums/MessagingProtocolType';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem } from 'resources';

describe('FavoriteAddCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method =  Commands.FAVORITE_ROOT.commandName;
    const subCommand = Commands.FAVORITE_ADD.commandName;

    let defaultProfileId;
    let defaultMarketId;

    let createdListingItemHash;
    let createdListingItemId;

    beforeAll(async () => {

        // clean up the db, first removes all data and then seeds the db with default data
        await testUtil.cleanDb();

        // fetch default profile
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;

        // fetch default market
        const defaultMarket = await testUtil.getDefaultMarket();
        defaultMarketId = defaultMarket.id;

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            true    // generateListingItemObjects
        ]).toParamsArray();

        // create item and store its id for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as ListingItem[];
        createdListingItemHash = listingItems[0].hash;
        createdListingItemId = listingItems[0].id;

    });

    test('Should add favorite item by profile id and listing id', async () => {
        // add favorite item
        const getDataRes: any = await rpc(method, [subCommand, defaultProfileId, createdListingItemId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.listingItemId).toBe(createdListingItemId);
        expect(result.profileId).toBe(defaultProfileId);
    });

    test('Should add favorite item by profile id and listing hash', async () => {
        // add favorite item by item hash and profile
        const getDataRes: any = await rpc(method, [subCommand, defaultProfileId, createdListingItemHash]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.listingItemId).toBe(createdListingItemId);
        expect(result.profileId).toBe(defaultProfileId);
    });

    test('Should fail because we want to create an empty favorite', async () => {
        const getDataRes: any = await rpc(method, [subCommand]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });
});
