import { rpc, api } from '../lib/api';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../src/core/Logger';
import {HashableObjectType} from '../../../src/api/enums/HashableObjectType';
import {ObjectHash} from '../../../src/core/helpers/ObjectHash';
import {TestDataGenerateRequest} from '../../../src/api/requests/TestDataGenerateRequest';


describe('ListingItemTemplateRemoveCommand', () => {

    const log: LoggerType = new LoggerType(__filename);

    const testUtil = new BlackBoxTestUtil();

    const templateCommand = Commands.TEMPLATE_ROOT.commandName;
    const templateRemoveCommand = Commands.TEMPLATE_REMOVE.commandName;

    let defaultProfile: resources.Profile;
    let defaultMarket: resources.Market;

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

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();
        defaultMarket = await testUtil.getDefaultMarket();

    });

    test('Should remove ListingItemTemplate', async () => {
        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false   // generateObjectDatas
        ]).toParamsArray();

        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplates[];

        createdTemplateId = listingItemTemplates[0].id;

        const result: any = await rpc(templateCommand, [templateRemoveCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(200);
    });

    test('Should fail remove ListingItemTemplate because ListingItemTemplate already removed', async () => {
        // remove Listing item template
        const result: any = await rpc(templateCommand, [templateRemoveCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(404);
    });

    test('Should fail remove ListingItemTemplate because ListingItemTemplate have related ListingItems', async () => {

        const generateListingItemTemplateParams = new GenerateListingItemTemplateParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false,  // generateListingItemObjects
            false,  // generateObjectDatas
            defaultProfile.id, // profileId
            true,   // generateListingItem
            defaultMarket.id  // marketId
        ]).toParamsArray();

        // generate ListingItemTemplate with ListingItem
        const listingItemTemplates = await testUtil.generateData(
            CreatableModel.LISTINGITEMTEMPLATE, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemTemplateParams   // what kind of data to generate
        ) as resources.ListingItemTemplate[];

        const listingItemTemplate = listingItemTemplates[0];
        createdTemplateId = listingItemTemplate.id;

        // expect template is related to correct profile and listingitem posted to correct market
        expect(listingItemTemplate.Profile.id).toBe(defaultProfile.id);
        expect(listingItemTemplate.ListingItems[0].marketId).toBe(defaultMarket.id);

        // expect template hash created on the server matches what we create here
        const generatedTemplateHash = ObjectHash.getHash(listingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);
        log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        log.debug('generatedTemplateHash:', generatedTemplateHash);
        expect(listingItemTemplate.hash).toBe(generatedTemplateHash);

        // expect the item hash generated at the same time as template, matches with the templates one
        log.debug('listingItemTemplate.hash:', listingItemTemplate.hash);
        log.debug('listingItemTemplate.ListingItems[0].hash:', listingItemTemplate.ListingItems[0].hash);
        expect(listingItemTemplate.hash).toBe(listingItemTemplate.ListingItems[0].hash);

        // remove Listing item template
        const result: any = await rpc(templateCommand, [templateRemoveCommand, createdTemplateId]);
        result.expectJson();
        result.expectStatusCode(404);
        expect(result.error.error.message).toBe(`ListingItemTemplate has ListingItems so it can't be deleted. id=${createdTemplateId}`);
    });
});
