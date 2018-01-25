import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { Currency } from '../../src/api/enums/Currency';
import { ShippingAvailability } from '../../src/api/enums/ShippingAvailability';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ImageDataProtocolType } from '../../src/api/enums/ImageDataProtocolType';

import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { Logger } from '../../src/core/Logger';
import { FavoriteAddCommand } from '../../src/api/commands/favorite/FavoriteAddCommand';
import { MarketCreateCommand } from '../../src/api/commands/market/MarketCreateCommand';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { ListingItemObjectType } from '../../src/api/enums/ListingItemObjectType';

describe('/FavoriteListCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method =  Commands.FAVORITE_ROOT.commandName;
    const addMakretMethod = Commands.MARKET_LIST.commandName;
    const favoriteListMethod = Commands.FAVORITE_LIST.commandName;

    let defaultProfileId;
    let listingItemId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        defaultProfileId = defaultProfile.id;

        // generate listing item
        const addListingItem = await testUtil.generateData('listingitem', 1);
        listingItemId = addListingItem[0].id;

    });

    test('Should return empty favorite list', async () => {
        const getDataRes: any = await rpc(method, [favoriteListMethod, listingItemId, defaultProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result).toHaveLength(0);
    });

    test('Should return one favorite list', async () => {
        // add favorite item
        await rpc(method, [listingItemId, defaultProfileId]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [favoriteListMethod, listingItemId, defaultProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result).toHaveLength(1);
        expect(result[0].profileId).toBe(defaultProfileId);
        expect(result[0].listingItemId).toBe(listingItemId);
    });


    test('Should return two favorite lists', async () => {
        // add favorite item
        await rpc(method, [listingItemId, defaultProfileId]);

        // get the favorite list
        const getDataRes: any = await rpc(method, [favoriteListMethod, listingItemId, defaultProfileId]);
        getDataRes.expectJson();
        getDataRes.expectStatusCode(200);
        const result: any = getDataRes.getBody()['result'];
        expect(result).toHaveLength(2);
        expect(result[0].profileId).toBe(defaultProfileId);
        expect(result[0].listingItemId).toBe(listingItemId);
        expect(result[1].profileId).toBe(defaultProfileId);
        expect(result[1].listingItemId).toBe(listingItemId);
    });

});
