import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('EscrowLockCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const lockCommand = Commands.ESCROW_LOCK.commandName;
    let defaultProfile;
    let createdAddress;
    let createdListingItem;


    beforeAll(async () => {
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

        const listingItem = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                                  // how many to generate
            true,                               // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItem[];
        createdListingItem = listingItem[0];

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();
    });

    test('Should lock Escrow', async () => {

        const escrowLockTestData = {
            itemhash: createdListingItem.hash,
            nonce: 'TEST NONCE',
            memo: 'TEST MEMO'
        };

        const escrowLockRes = await rpc('escrow', ['lock',
            createdListingItem.hash, escrowLockTestData.nonce, escrowLockTestData.memo]);
        escrowLockRes.expectJson();

        escrowLockRes.expectStatusCode(200);

    });
});
