import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, ListingItemTemplate } from 'resources';

// Ryno
import { BidMessageType } from '../../../src/api/enums/BidMessageType';

describe('EscrowReleaseCommand', () => {

    const testUtil = new BlackBoxTestUtil();
    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const lockCommand = Commands.ESCROW_RELEASE.commandName;
    const releaseCommand = Commands.ESCROW_RELEASE.commandName;
    let createdListingItem;

    const escrowLockTestData = {
        itemhash: '',
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

    test('Should Release Escrow by RPC', async () => {
        // 1) First create the escrow lock
        const escrowLockTestData = {
            itemhash: createdListingItem.hash,
            nonce: 'TEST NONCE',
            memo: 'TEST MEMO'
        };

        // create bid
        const bid = await testUtil.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_ACCEPT,
            bidData: [
                // TODO: Move to test data file
                { id: 'pubkeys', value: [
                    '02dcd01e1c1bde4d5f8eff82cde60017f81ac1c2888d04f47a31660004fe8d4bb7',
                    '035059134217aec66013c46db3ef62a1e7523fc962d2560858cd16d9c0032b113f'
                ] },
                { id: 'rawtx', value: 'a00000000000020c7333168e97e67bf278e04343178b2c368f4fba0b07cdc213bacc3e3845adb70100000000ffffffff5c70bd29c6a2049781907d7920d20b1e3ffb76f1d44d121eb07e198995bdac910000000000ffffffff0301375c8c610100000017a9143a8b5e616edc983a94a8ecd4b16b17c6180478e28701e36350bf390000001976a9142208a47ce301330b8dd9598880336cecff6a003f88ac01cb1097bdd00100001976a9142740d5e099f5542f64748cf7ef6a138d753aa38188ac0248304502210097acb0245bb135d02d2277ce7182ec2f41cb8830d6681caf288ac47ce3465fd402203122066499ea901673fe0adfcb0ea64e9e33584f864134a7d9cac2b5cc9c3727012103fb1823abc67cd8ed769d03d59fc0c8fc39f7d8455d98e09cc7d8b41a7e0d83a200' },
                { id: 'address', value: 'pejYH4pzr6WV7VDJ243KQywNsPaqZwDWbv' }
            ],
            listing_item_id: createdListingItem.id
        });

        const escrowLockRes = await rpc(escrowCommand, [
            lockCommand,
            createdListingItem.hash,
            escrowLockTestData.nonce,
            escrowLockTestData.memo
        ]);

        escrowLockRes.expectStatusCode(200);


    });

});
