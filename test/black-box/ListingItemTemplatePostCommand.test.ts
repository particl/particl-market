import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('ListingItemPostCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.TEMPLATE_ROOT.commandName;
    const subCommand = Commands.TEMPLATE_POST.commandName;

    const marketMethod = Commands.MARKET_ROOT.commandName;
    const marketSubCommand = Commands.MARKET_ADD.commandName;

    let listingItemTemplace;

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

        const testDataListingItemTemplate = {
            profile_id: 0,
            hash: '',
            paymentInformation: {
                type: PaymentType.SALE
            }
        } as ListingItemTemplateCreateRequest;

        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        listingItemTemplace = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];

    });

    test('Should post a item in to the market place without market id', async () => {
        // expect(listingItemTemplace).toBe(4);
        const res: any = await rpc(method, [subCommand, listingItemTemplace[0].id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result = res.getBody()['result'];
        expect(result).toHaveProperty('ItemInformation');
        expect(result).toHaveProperty('PaymentInformation');
        expect(result).toHaveProperty('MessagingInformation');
        expect(result.id).toBe(listingItemTemplace[0].id);
    });

    test('Should post a item in to the market place with market id', async () => {
        const marketRes = await rpc(marketMethod, [marketSubCommand, 'Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = marketRes.getBody()['result'];

        const res: any = await rpc(method, [subCommand, listingItemTemplace[0].id, resultMarket.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result = res.getBody()['result'];
        expect(result).toHaveProperty('ItemInformation');
        expect(result).toHaveProperty('PaymentInformation');
        expect(result).toHaveProperty('MessagingInformation');
        expect(result.id).toBe(listingItemTemplace[0].id);
    });


    test('Should fail to post a item in to the market place because of invalid listingItemTemplate id', async () => {
        // post item with invalid listingItemTemplate id
        const res: any = await rpc(method, [subCommand, 55]);
        res.expectJson();
        res.expectStatusCode(404);
    });

});
