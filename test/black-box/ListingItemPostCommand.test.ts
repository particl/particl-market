import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Logger } from '../../src/core/Logger';
import { ListingItemPostCommand } from '../../src/api/commands/listingitem/ListingItemPostCommand';
import { MarketCreateCommand } from '../../src/api/commands/market/MarketCreateCommand';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';

describe('ListingItemPostCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const listingItemTemplateService = null;
    const messageBroadcastService = null;
    const itemFactory = null;
    const marketService = null;
    const listingItemService = null;
    const method =  new ListingItemPostCommand(listingItemTemplateService, messageBroadcastService, itemFactory, marketService, null, Logger).name;
    const addMakretMethod =  new MarketCreateCommand(listingItemService, Logger).name;
    let listingItemTemplace;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const testDataListingItemTemplate = {
            profile_id: 0,
            hash: '',
            paymentInformation: {
                type: PaymentType.SALE
            }
        } as ListingItemTemplateCreateRequest;

        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // const = listingTemplace = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        listingItemTemplace = await testUtil.generateData('listingitemtemplate', 1);
        // listingItemTemplace = listingTemplace.getBody()['result'];
    });

    test('Should post a item in to the market place without market id', async () => {
        // expect(listingItemTemplace).toBe(4);
        const res: any = await rpc(method, [listingItemTemplace[0].id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result = res.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplace[0].hash);
        expect(result).toHaveProperty('ItemInformation');
        expect(result).toHaveProperty('PaymentInformation');
        expect(result).toHaveProperty('MessagingInformation');
        expect(result.id).toBe(listingItemTemplace[0].id);
    });

    test('Should post a item in to the market place with market id', async () => {
        const marketRes = await rpc(addMakretMethod, ['Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = marketRes.getBody()['result'];

        const res: any = await rpc(method, [listingItemTemplace[0].id, resultMarket.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result = res.getBody()['result'];
        expect(result.hash).toBe(listingItemTemplace[0].hash);
        expect(result).toHaveProperty('ItemInformation');
        expect(result).toHaveProperty('PaymentInformation');
        expect(result).toHaveProperty('MessagingInformation');
        expect(result.id).toBe(listingItemTemplace[0].id);
    });


    test('Should fail to post a item in to the market place because of invalid listingItemTemplate id', async () => {
        // post item with invalid listingItemTemplate id
        const res: any = await rpc(method, [55]);
        res.expectJson();
        res.expectStatusCode(404);
    });

});
