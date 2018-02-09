import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('EscrowReleaseCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ESCROW_ROOT.commandName;
    const subCommand = Commands.ESCROW_RELEASE.commandName;
    let createdListingItem;

    const escrowLockTestData = {
        itemhash: '',
        memo: 'TEST MEMO'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        const generateListingItemParams = new GenerateListingItemParams([
            false,   // generateItemInformation
            false,   // generateShippingDestinations
            false,   // generateItemImages
            false,   // generatePaymentInformation
            false,   // generateEscrow
            false,   // generateItemPrice
            false,   // generateMessagingInformation
            false    // generateListingItemObjects
        ]).toParamsArray();

        // generate listing item
        const listingItem = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                          // how many to generate
            true,                       // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItem[];
        createdListingItem = listingItem[0];
    });

    test('Should Release Escrow by RPC', async () => {
        // set hash
        escrowLockTestData.itemhash = createdListingItem.hash;

        const escrowLockRes = await rpc(method, [subCommand,
            createdListingItem.hash, escrowLockTestData.memo]);
        escrowLockRes.expectJson();

        // expecting 404, the code is nowhere near finished
        escrowLockRes.expectStatusCode(404);

    });

});
