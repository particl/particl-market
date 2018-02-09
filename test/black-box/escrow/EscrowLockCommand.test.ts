import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('EscrowLockCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const method = Commands.ESCROW_ROOT.commandName;
    const subCommand = Commands.ESCROW_LOCK.commandName;
    let defaultProfile;
    let createdAddress;
    let createdListingItem;

    const addressTestData = {
        title: 'Work',
        addressLine1: '123 6th St',
        addressLine2: 'Melbourne, FL 32904',
        city: 'Melbourne',
        state: 'Mel State',
        country: 'Finland',
        zipCode: '85001'
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

        const listingItem = await testUtil.generateData(
            CreatableModel.LISTINGITEM, // what to generate
            1,                                  // how many to generate
            true,                               // return model
            generateListingItemParams   // what kind of data to generate
        ) as ListingItem[];
        createdListingItem = listingItem[0];

        // get default profile
        defaultProfile = await testUtil.getDefaultProfile();

        // create address
        const addressRes = await rpc(Commands.ADDRESS_ROOT.commandName, [Commands.ADDRESS_ADD.commandName,
            defaultProfile.id,
            addressTestData.title,
            addressTestData.addressLine1, addressTestData.addressLine2,
            addressTestData.city, addressTestData.state, addressTestData.country, addressTestData.zipCode]);
        addressRes.expectJson();
        addressRes.expectStatusCode(200);
        createdAddress = addressRes.getBody()['result'];

    });

    test('Should lock Escrow', async () => {

        const escrowLockTestData = {
            itemhash: createdListingItem.hash,
            nonce: 'TEST NONCE',
            addressId: createdAddress.id,
            memo: 'TEST MEMO'
        };

        const escrowLockRes = await rpc(method, [subCommand,
            createdListingItem.hash, escrowLockTestData.nonce, createdAddress.id, escrowLockTestData.memo]);
        escrowLockRes.expectJson();

        // expecting 404, the code is nowhere near finished
        escrowLockRes.expectStatusCode(404);

    });

});
