import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('/FavoriteListCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method =  Commands.FAVORITE_ROOT.commandName;
    const addMakretMethod = Commands.MARKET_LIST.commandName;
    const favoriteListMethod = Commands.FAVORITE_LIST.commandName;

    let defaultProfileId;
    let listingItemId;
    let addListingItemSecondId;

    beforeAll(async () => {
        await testUtil.cleanDb();
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


        const defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;

        // generate listing item
        const addListingItem = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItem[];
        listingItemId = addListingItem[0].id;

        // generate listing item

        // generate listing item
        const addListingItemTwo = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItem[];
        addListingItemSecondId = addListingItemTwo[0].id;

    });

    test('Should return empty favorite list', async () => {
        const getDataRes: any = await rpc(method, [favoriteListMethod, defaultProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should return one favorite list', async () => {
        // add favorite item
        await rpc(method, [Commands.FAVORITE_ADD.commandName, defaultProfileId, listingItemId]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [favoriteListMethod, defaultProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(1);
        expect(result[0].profileId).toBe(defaultProfileId);
        expect(result[0].listingItemId).toBe(listingItemId);
    });


    test('Should return two favorite lists', async () => {
        // add favorite item
        await rpc(method, [Commands.FAVORITE_ADD.commandName, defaultProfileId, addListingItemSecondId]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [favoriteListMethod, defaultProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result.length).toBe(2);
        expect(result[0].profileId).toBe(defaultProfileId);
        expect(result[0].listingItemId).toBe(listingItemId);
        expect(result[1].profileId).toBe(defaultProfileId);
        expect(result[1].listingItemId).toBe(addListingItemSecondId);
    });
});
