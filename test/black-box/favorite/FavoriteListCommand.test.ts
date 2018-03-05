import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, Profile } from 'resources';
import { GenerateProfileParams } from '../../../src/api/requests/params/GenerateProfileParams';

describe('FavoriteListCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.FAVORITE_ROOT.commandName;
    const subCommand = Commands.FAVORITE_LIST.commandName;

    let defaultProfile;
    let defaultMarketId;

    let createdListingItemIdOne;
    let createdListingItemIdTwo;

    let createdProfileId;

    beforeAll(async () => {

        // clean up the db, first removes all data and then seeds the db with default data
        await testUtil.cleanDb();

        // fetch default profile
        const profile = await testUtil.getDefaultProfile();
        defaultProfile = profile;

        // fetch default market
        const defaultMarket = await testUtil.getDefaultMarket();
        defaultMarketId = defaultMarket.id;

        const generateListingItemParams = new GenerateListingItemParams([
            false,   // generateItemInformation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // create two items and store their id's for testing
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

    test('Should return one favorite list by profile id with default related = true', async () => {

        // add favorite item
        await rpc(method, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, createdListingItemIdOne]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [subCommand, defaultProfile.id]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].profileId).toBe(defaultProfile.id);
        expect(result[0].listingItemId).toBe(createdListingItemIdOne);
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(defaultProfile.id);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.id).toBe(createdListingItemIdOne);

        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();
    });

    test('Should return one favorite list by profile name', async () => {

        // add favorite item
        await rpc(method, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, createdListingItemIdOne]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [subCommand, defaultProfile.name]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];

        expect(result.length).toBe(1);
        expect(result[0].profileId).toBe(defaultProfile.id);
        expect(result[0].listingItemId).toBe(createdListingItemIdOne);
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(defaultProfile.id);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.id).toBe(createdListingItemIdOne);

        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();
    });

    test('Should fail to get favorite list because invalid profile name', async () => {
        const profileName = 'INVALID PROFILE NAME';
        const getDataRes: any = await rpc(method, [subCommand, profileName]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(404);
        expect(getDataRes.error.error.success).toBe(false);
        expect(getDataRes.error.error.message).toBe(`Profile with the name = ${profileName} was not found!`);
    });

    test('Should fail to get favorite list because invalid profile id', async () => {
        const getDataRes: any = await rpc(method, [subCommand, createdProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];

        expect(result).toHaveLength(0);
    });

    test('Should return two favorite lists by profile id', async () => {

        // add favorite item
        await rpc(method, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, createdListingItemIdTwo]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [subCommand, defaultProfile.id]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].profileId).toBe(defaultProfile.id);
        expect(result[0].listingItemId).toBe(createdListingItemIdOne);
        expect(result[0].Profile).toBeDefined();
        expect(result[0].Profile.id).toBe(defaultProfile.id);
        expect(result[0].ListingItem).toBeDefined();
        expect(result[0].ListingItem.id).toBe(createdListingItemIdOne);
        expect(result[0].ListingItem.Bids).toBeDefined();
        expect(result[0].ListingItem.FlaggedItem).toBeDefined();
        expect(result[0].ListingItem.ItemInformation).toBeDefined();
        expect(result[0].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[0].ListingItem.Market).toBeDefined();
        expect(result[0].ListingItem.MessagingInformation).toBeDefined();
        expect(result[0].ListingItem.PaymentInformation).toBeDefined();

        expect(result[1].profileId).toBe(defaultProfile.id);
        expect(result[1].listingItemId).toBe(createdListingItemIdTwo);
        expect(result[1].Profile).toBeDefined();
        expect(result[1].Profile.id).toBe(defaultProfile.id);
        expect(result[1].ListingItem).toBeDefined();
        expect(result[1].ListingItem.id).toBe(createdListingItemIdTwo);
        expect(result[1].ListingItem.Bids).toBeDefined();
        expect(result[1].ListingItem.FlaggedItem).toBeDefined();
        expect(result[1].ListingItem.ItemInformation).toBeDefined();
        expect(result[1].ListingItem.ListingItemObjects).toBeDefined();
        expect(result[1].ListingItem.Market).toBeDefined();
        expect(result[1].ListingItem.MessagingInformation).toBeDefined();
        expect(result[1].ListingItem.PaymentInformation).toBeDefined();

    });

    test('Should return two favorite lists by profile name without related', async () => {

        // add favorite item
        await rpc(method, [Commands.FAVORITE_ADD.commandName, defaultProfile.id, createdListingItemIdTwo]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [subCommand, defaultProfile.name, false]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];

        expect(result.length).toBe(2);
        expect(result[0].profileId).toBe(defaultProfile.id);
        expect(result[0].listingItemId).toBe(createdListingItemIdOne);
        expect(result[0].Profile).not.toBeDefined();
        expect(result[0].ListingItem).not.toBeDefined();

        expect(result[1].profileId).toBe(defaultProfile.id);
        expect(result[1].listingItemId).toBe(createdListingItemIdTwo);

        expect(result[1].Profile).not.toBeDefined();
        expect(result[1].ListingItem).not.toBeDefined();
    });
});
