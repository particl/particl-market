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
import {GenerateListingItemParams} from '../../../src/api/requests/params/GenerateListingItemParams';
import {ListingItem, Profile} from 'resources';
import {GenerateProfileParams} from '../../../src/api/requests/params/GenerateProfileParams';

describe('FavoriteRemoveCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method =  Commands.FAVORITE_ROOT.commandName;
    const subCommand = Commands.FAVORITE_REMOVE.commandName;
    const subCommandList = Commands.FAVORITE_LIST.commandName;

    let defaultProfileId;
    let defaultMarketId;

    let createdListingItemIdOne;
    let createdListingItemHashOne;

    let createdProfileId;

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

        // create two items and store their id's for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as ListingItem[];

        // store id's for testing
        createdListingItemIdOne = listingItems[0].id;
        createdListingItemHashOne = listingItems[0].hash;

        // create a second profile
        const generateProfileParams = new GenerateProfileParams([
            true,   // generateShippingAddresses
            true   // generateCryptocurrencyAddresses
        ]).toParamsArray();

        const profiles = await testUtil.generateData(
            CreatableModel.PROFILE,             // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateProfileParams               // what kind of data to generate
        ) as Profile[];
        createdProfileId = profiles[0].id;
    });

    test('Should remove favorite item by profile id and listing id', async () => {
        // add favorite item
        await testUtil.addData(CreatableModel.FAVORITEITEM, {
            listing_item_id: createdListingItemIdOne,
            profile_id: createdProfileId
        });

        // remove favorite item by item id and profile
        const removeResult: any = await rpc(method, [subCommand, createdProfileId, createdListingItemIdOne]);
        removeResult.expectJson();
        removeResult.expectStatusCode(200);

        // check that the remove really worked
        const listResult: any = await rpc(method, [subCommandList, createdProfileId]);
        listResult.expectJson();
        listResult.expectStatusCode(200);
        const result: any = listResult.getBody()['result'];

        expect(result.length).toBe(0);
    });

    test('Should remove favorite item by profile id and hash', async () => {
        // add favorite item
        await testUtil.addData(CreatableModel.FAVORITEITEM, {
            listing_item_id: createdListingItemIdOne,
            profile_id: createdProfileId
        });

        // remove favorite item by item id and profile
        const removeResult: any = await rpc(method, [subCommand, createdProfileId, createdListingItemHashOne]);
        removeResult.expectJson();
        removeResult.expectStatusCode(200);

        // check that the remove really worked
        const listResult: any = await rpc(method, [subCommandList, createdProfileId]);
        listResult.expectJson();
        listResult.expectStatusCode(200);
        const result: any = listResult.getBody()['result'];

        expect(result.length).toBe(0);
    });

    test('Should fail remove favorite because favorite already removed', async () => {
        // remove favorite
        const getDataRes: any = await rpc(method, [subCommand, createdProfileId, createdListingItemIdOne]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
    });
});
