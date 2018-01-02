import { rpc, api } from './lib/api';
import * as crypto from 'crypto-js';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';

describe('UpdateMessagingInformation', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = 'updatemessaginginformation';

    const testDataListingItemTemplate = {
        profile_id: 0,
        itemInformation: {
            title: 'Item Information with Templates First',
            shortDescription: 'Item short description with Templates First',
            longDescription: 'Item long description with Templates First',
            itemCategory: {
                key: 'cat_high_luxyry_items'
            },
            listingItemId: null
        },
        messagingInformation: [{
            listingItemId: null
        }]
    };

    let createdTemplateId;
    let listingItemId;

    beforeAll(async () => {
        await testUtil.cleanDb();
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;
        // create listing-item-template
        const addListingItemTempRes: any = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const result: any = addListingItemTempRes.getBody()['result'];
        createdTemplateId = result.id;

        // listing-item
        const listingItems = await testUtil.generateData('listingitem', 1);
        listingItemId = listingItems[0]['id'];
    });

    const messageInfoData = {
        protocol: MessagingProtocolType.SMSG,
        publicKey: 'publickey1'
    };

    test('Should update the message-information', async () => {
        const res = await rpc(method, [createdTemplateId, messageInfoData.protocol, messageInfoData.publicKey]);
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
        testDataListingItemTemplate.messagingInformation[0].listingItemId = 1;

        // create new item template
        const listingItemTemplate = await testUtil.addData('listingitemtemplate', testDataListingItemTemplate);
        const listingItemTemplateId = listingItemTemplate.getBody()['result'].id;
        const res = await rpc(method, [listingItemTemplateId, messageInfoData.protocol, messageInfoData.publicKey]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.success).toBe(false);
        expect(res.error.error.message).toBe('Messaging information cannot be updated if there is a ListingItem related to ListingItemTemplate.');
    });

});
