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

    beforeAll( async () => {
        // IDK Why this is crashing here...
        try {
            await testUtil.cleanDb();
        } catch (e) {
            //
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

// tslint:disable:max-line-length
        // create bid
        const bid = await testUtil.addData(CreatableModel.BID, {
            action: BidMessageType.MPA_ACCEPT,
            bidData: [
                // TODO: Move to test data file
                { id: 'pubkeys', value: [
                    '02dcd01e1c1bde4d5f8eff82cde60017f81ac1c2888d04f47a31660004fe8d4bb7',
                    '03b4977fbfd91051ea027d991b1139161ce422b1ca5c92cbf7f54da5fa4ef1688e'
                ] },
                { id: 'rawtx', value: 'a00000000000020b6430436b417f70ce93a237cdb370644d93dcc1fcdc00ac0fea45c738545edf0200000000ffffffffa889a92c4f611856537f6b7cb08a6f933517f226062dcdc59f5e8c58396cfde30100000000ffffffff030134da7ef10500000017a9140e0dc3fa0d3b50e064f345395c4d8c74923daf6f87019f65286f720000001976a9142da4130db4567ae9d62f6d332b33d007e6a896f188ac017867f5b2cd0100001976a9142740d5e099f5542f64748cf7ef6a138d753aa38188ac02483045022100a8f6b6166d2702b91fbe93420197080286095719f895bcd94749b1c670b6aa13022058991eea3298b389c717f556031aed14734e9904bb2b117fdfc1297b50c2a7e2012103fb1823abc67cd8ed769d03d59fc0c8fc39f7d8455d98e09cc7d8b41a7e0d83a200' },
                { id: 'address', value: 'pejYH4pzr6WV7VDJ243KQywNsPaqZwDWbv' }
            ],
            listing_item_id: createdListingItem.id
        });
// tslint:enable:max-line-length

        const escrowLockRes = await rpc(escrowCommand, [
            lockCommand,
            createdListingItem.hash,
            escrowLockTestData.nonce,
            escrowLockTestData.memo
        ]);

        escrowLockRes.expectStatusCode(200);


    });

});
