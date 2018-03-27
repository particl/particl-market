import { rpc, api } from './lib/api';
import * as crypto from 'crypto-js';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ObjectHashService } from '../../src/api/services/ObjectHashService';
import { Commands} from '../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, ListingItemTemplate } from 'resources';
import { HashableObjectType } from '../../src/api/enums/HashableObjectType';

describe('MessagingInformationUpdateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.MESSAGINGINFORMATION_ROOT.commandName;
    const subCommand = Commands.MESSAGINGINFORMATION_UPDATE.commandName;

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            listingItemId: null,
            itemCategory: {
                id: null
            },
            itemLocation: {
                region: 'China',
                address: 'USA'
            }
        },
        messagingInformation: [{
            listingItemId: null,
            protocol: MessagingProtocolType.SMSG,
            publicKey: 'publickey2'
        }],
        paymentInformation: {
            type: PaymentType.SALE
        }
    } as ListingItemTemplateCreateRequest;

    let createdTemplateId;
    let listingItemId;

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            true,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            true,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();


        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = await this.ObjectHashService.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

        // get categories
        const categories = await rpc(Commands.CATEGORY_ROOT.commandName, [Commands.CATEGORY_LIST.commandName]);
        const categoryList: any = categories.getBody()['result'];

        // set category id
        testDataListingItemTemplate.itemInformation.itemCategory.id = categoryList.id;
        // create listing-item-template
        const addListingItemTempRes: any = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);
        const result: any = addListingItemTempRes;
        createdTemplateId = result.id;

        // listing-item
        const listingItems = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItem[];

        listingItemId = listingItems[0]['id'];
    });

    const messageInfoData = {
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey2'
    };

    test('Should fail to update message-information because empty body', async () => {
        const res = await rpc(method, [subCommand, createdTemplateId]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should fail to update message-information because invalid protocol body', async () => {
        const res = await rpc(method, [subCommand, createdTemplateId, 'test', messageInfoData.publicKey]);
        res.expectJson();
        res.expectStatusCode(400);
    });

    test('Should update the message-information', async () => {
        const res = await rpc(method, [subCommand, createdTemplateId, messageInfoData.protocol, messageInfoData.publicKey]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.protocol).toBe(messageInfoData.protocol);
        expect(result.publicKey).toBe(messageInfoData.publicKey);
        expect(result.listingItemId).toBe(null);
        expect(result.listingItemTemplateId).toBe(createdTemplateId);
    });

    test('Should not update the message-information if listing-item related with it', async () => {
        // set listing item id in item information
        testDataListingItemTemplate.itemInformation.listingItemId = listingItemId;
        // set listing item id in message information
        testDataListingItemTemplate.messagingInformation[0].listingItemId = listingItemId;

        // set hash
        testDataListingItemTemplate.hash = await this.ObjectHashService.getHash(testDataListingItemTemplate, HashableObjectType.LISTINGITEMTEMPLATE);

        // create new item template
        const listingItemTemplate = await testUtil.addData(CreatableModel.LISTINGITEMTEMPLATE, testDataListingItemTemplate);

        const listingItemTemplateId = listingItemTemplate.id;
        const res = await rpc(method, [subCommand, listingItemTemplateId, messageInfoData.protocol, messageInfoData.publicKey]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Messaging information cannot be updated if there is a ListingItem related to ListingItemTemplate.');
    });

});
