import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { PaymentType } from '../../../src/api/enums/PaymentType';
import { ListingItemTemplateCreateRequest } from '../../../src/api/requests/ListingItemTemplateCreateRequest';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('ListingItemPostCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    let listingItemTemplace;
    let defaultProfile;
    let defaultMarket;

    beforeAll(async () => {
        await testUtil.cleanDb();

        // fetch default profile
        defaultProfile = await testUtil.getDefaultProfile();

        // fetch default market
        defaultMarket = await testUtil.getDefaultMarket();

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

        listingItemTemplace = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];

    });

    test('Should post a item in to the market place with market id', async () => {
        /*
        const res: any = await rpc(templateCommand, [templatePostCommand, listingItemTemplace[0].id, defaultMarket.id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result = res.getBody()['result'];
        expect(result).toHaveProperty('ItemInformation');
        expect(result).toHaveProperty('PaymentInformation');
        expect(result).toHaveProperty('MessagingInformation');
        expect(result.id).toBe(listingItemTemplace[0].id);
        */
    });

    test('Should post a item in to the market place without market id', async () => {
        /*
        const res: any = await rpc(templateCommand, [templatePostCommand, listingItemTemplace[0].id]);
        res.expectJson();
        res.expectStatusCode(200);
        const result = res.getBody()['result'];
        expect(result).toHaveProperty('ItemInformation');
        expect(result).toHaveProperty('PaymentInformation');
        expect(result).toHaveProperty('MessagingInformation');
        expect(result.id).toBe(listingItemTemplace[0].id);
        */
    });

    test('Should fail to post a item in to the market place because of invalid listingItemTemplate id', async () => {
        /*
        // post item with invalid listingItemTemplate id
        const res: any = await rpc(templateCommand, [templatePostCommand, 55]);
        res.expectJson();
        res.expectStatusCode(404);
        */
    });

    test('Should have received posted listingitem', async () => {
        // asdf
        const test = 1;
    });



});
