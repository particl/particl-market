import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../src/api/requests/params/GenerateListingItemTemplateParams';
import { ListingItem, ListingItemTemplate } from 'resources';


describe('ListingItemTemplateRemoveCommand', () => {
    const testUtil = new BlackBoxTestUtil();
    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const removeCommand = Commands.TEMPLATE_REMOVE.commandName;

    let profile;
    let createdTemplateId;

    const listingItemData = {
        listing_item_template_id: null,
        market_id: 0,
        hash: 'hash2',
        itemInformation: {
            title: 'title UPDATED',
            shortDescription: 'item UPDATED',
            longDescription: 'item UPDATED',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            }
        }
    };

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

        profile = await testUtil.getDefaultProfile();
    });

    test('Should remove Listing Item Template', async () => {
        const listingitemtemplate = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];

        createdTemplateId = listingitemtemplate[0].id;

        const result: any = await rpc(templateCommand, [removeCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(200);
    });

    test('Should fail remove Listing Item Template because Listing Item Template already removed', async () => {
        // remove Listing item template
        const result: any = await rpc(templateCommand, [removeCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(404);
    });

    test('Should fail remove Listing Item Template because Listing Item Template have related listing-items', async () => {
        // listingItem template
        const listingitemtemplate = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as ListingItemTemplate[];

        createdTemplateId = listingitemtemplate[0]['id'];

        // market
        const res = await rpc(Commands.MARKET_ROOT.commandName, [Commands.MARKET_ADD.commandName, 'Test Market', 'privateKey', 'Market Address']);
        const resultMarket: any = res.getBody()['result'];
        listingItemData.market_id = resultMarket.id;

        // listingItem
        listingItemData.listing_item_template_id = createdTemplateId;
        const addListingItem: any = await testUtil.addData(CreatableModel.LISTINGITEM, listingItemData);

        // remove Listing item template
        const result: any = await rpc(templateCommand, [removeCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe(`ListingItemTemplate has ListingItems so it can't be deleted. id=${createdTemplateId}`);
    });
});
