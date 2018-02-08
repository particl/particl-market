import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import {ListingItem, Profile} from 'resources';
import {GenerateProfileParams} from '../../../src/api/requests/params/GenerateProfileParams';

describe('FavoriteListCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method =  Commands.FAVORITE_ROOT.commandName;
    const subCommand = Commands.FAVORITE_LIST.commandName;

    let defaultProfileId;
    let defaultMarketId;

    let createdListingItemIdOne;
    let createdListingItemIdTwo;

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

        // create items and store their id's for testing
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM,         // what to generate
            2,                          // how many to generate
            true,                    // return model
            generateListingItemParams           // what kind of data to generate
        ) as ListingItem[];

        // store id's for testing
        createdListingItemIdOne = listingItems[0].id;
        createdListingItemIdTwo = listingItems[1].id;

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

    test('Should return empty favorite list', async () => {
        const getDataRes: any = await rpc(method, [subCommand, createdProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];

        expect(result).toHaveLength(0);
    });

    test('Should return one favorite list', async () => {

        // add favorite item
        await rpc(method, [Commands.FAVORITE_ADD.commandName, defaultProfileId, createdListingItemIdOne]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [subCommand, defaultProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].profileId).toBe(defaultProfileId);
        expect(result[0].listingItemId).toBe(createdListingItemIdOne);
    });

    test('Should return two favorite lists', async () => {

        // add favorite item
        await rpc(method, [Commands.FAVORITE_ADD.commandName, defaultProfileId, createdListingItemIdTwo]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [subCommand, defaultProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].profileId).toBe(defaultProfileId);
        expect(result[0].listingItemId).toBe(createdListingItemIdOne);
        expect(result[1].profileId).toBe(defaultProfileId);
        expect(result[1].listingItemId).toBe(createdListingItemIdTwo);
    });
});
