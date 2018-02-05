import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('ListingItemTemplateRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const method = Commands.TEMPLATE_ROOT.commandName;
    const subCommand = Commands.TEMPLATE_REMOVE.commandName;

    let profile;
    let createdTemplateId;

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

    beforeAll(async () => {
        await testUtil.cleanDb();
        // add profile for testing
        profile = await testUtil.getDefaultProfile();
    });

    test('Should remove Listing Item Template', async () => {

        const listingitemtemplate = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];

        createdTemplateId = listingitemtemplate[0]['id'];
        // remove Listing Item Template
        const result: any = await rpc(method, [subCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(200);
    });

    test('Should fail remove Listing Item Template because Listing Item Template already removed', async () => {
        // remove Listing item template
        const result: any = await rpc(method, [subCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(404);
    });
});
