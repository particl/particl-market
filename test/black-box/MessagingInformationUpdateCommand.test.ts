import { rpc, api } from './lib/api';
import * as crypto from 'crypto-js';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { MessagingProtocolType } from '../../src/api/enums/MessagingProtocolType';
import { Currency } from '../../src/api/enums/Currency';
import { CryptocurrencyAddressType } from '../../src/api/enums/CryptocurrencyAddressType';
import { PaymentType } from '../../src/api/enums/PaymentType';
import { EscrowType } from '../../src/api/enums/EscrowType';
import { ListingItemTemplateCreateRequest } from '../../src/api/requests/ListingItemTemplateCreateRequest';
import { ObjectHash } from '../../src/core/helpers/ObjectHash';
import { Logger } from '../../src/core/Logger';
import { MessagingInformationUpdateCommand } from '../../src/api/commands/messaginginformation/MessagingInformationUpdateCommand';

describe('MessagingInformationUpdateCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const listingItemTemplateService = null;
    const messagingInformationService = null;
    const method =  new MessagingInformationUpdateCommand(listingItemTemplateService, messagingInformationService, Logger).name;

    const testDataListingItemTemplate = {
        profile_id: 0,
        hash: '',
        itemInformation: {
            title: 'Item Information with Templates',
            shortDescription: 'Item short description with Templates',
            longDescription: 'Item long description with Templates',
            listingItemId: null,
            itemCategory: {
                key: 'cat_high_luxyry_items'
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
        const defaultProfile = await testUtil.getDefaultProfile();
        testDataListingItemTemplate.profile_id = defaultProfile.id;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

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
        publicKey: 'publickey2'
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
        testDataListingItemTemplate.messagingInformation[0].listingItemId = listingItemId;

        // set hash
        testDataListingItemTemplate.hash = ObjectHash.getHash(testDataListingItemTemplate);

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
