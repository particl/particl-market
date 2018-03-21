import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('ListingItemTemplatePostCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templatePostCommand = Commands.TEMPLATE_POST.commandName;

    const log: LoggerType = new LoggerType(__filename);

    let listingItemTemplates: ListingItemTemplate[];
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
            true    // generateListingItemObjects
        ]).toParamsArray();

        listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                    // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];

        log.debug('beforeAll');
        console.log('beforeAll');

    });

    test('Should post a ListingItem in to the default marketplace', async (done) => {

        log.debug('test');
        console.log('test');
        const ffs = true;

        const res: any = await rpc(templateCommand, [templatePostCommand, listingItemTemplates[0].id, defaultMarket.id]);

        res.expectJson();
        res.expectStatusCode(200);
        const result = res.getBody()['result'];
        expect(result.version).toBe('0.0.1.0');
        // expect(result).toHaveProperty('PaymentInformation');
        // expect(result).toHaveProperty('MessagingInformation');
        // expect(result.id).toBe(listingItemTemplace[0].id);

    });

    /*
    test('Should post a item in to the market place without market id', async () => {
        const res: any = await rpc(templateCommand, [templatePostCommand, listingItemTemplace[0].id]);
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
        const res: any = await rpc(templateCommand, [templatePostCommand, 55]);
        res.expectJson();
        res.expectStatusCode(404);
    });

    test('Should have received posted listingitem', async () => {
        // asdf
        const test = 1;
    });
    */


});
