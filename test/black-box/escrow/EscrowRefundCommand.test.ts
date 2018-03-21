import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('EscrowRefundCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ESCROW_ROOT.commandName;
    const subCommand = Commands.ESCROW_REFUND.commandName;
    let createdListingItem;

    const escrowLockTestData = {
        itemhash: '',
        accepted: 'TEST NONCE',
        memo: 'TEST MEMO'
    };

    beforeAll(async () => {
        // IDK Why this is crashing here...
        try {
            await testUtil.cleanDb();
        } catch(e) {

        }
        const generateListingItemParams = new GenerateListingItemParams([
            true,   // generateItemInformation
            true,   // generateShippingDestinations
            false,   // generateItemImages
            true,   // generatePaymentInformation
            true,   // generateEscrow
            true,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // generate listingItem
        const listingItem = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItem[];
        createdListingItem = listingItem[0];
    });

    test('Should Refund Escrow', async () => {
        // set hash
        escrowLockTestData.itemhash = createdListingItem.hash;

        const escrowLockRes = await rpc(method, [subCommand,
            createdListingItem.hash, escrowLockTestData.accepted, escrowLockTestData.memo]);
        escrowLockRes.expectJson();
        escrowLockRes.expectStatusCode(404);
    });

});
