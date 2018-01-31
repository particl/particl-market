import { rpc, api } from './lib/api';
import { BlackBoxTestUtil } from './lib/BlackBoxTestUtil';
import { Commands } from '../../src/api/commands/CommandEnumType';

describe('/EscrowRefundCommand', () => {

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
        await testUtil.cleanDb();
        // generate listingItem
        const listingItem = await testUtil.generateData('listingitem', 1);
        createdListingItem = listingItem[0];
    });

    test('Should Refund Escrow by RPC', async () => {
        // set hash
        escrowLockTestData.itemhash = createdListingItem.hash;

        const escrowLockRes = await rpc(method, [subCommand,
            createdListingItem.hash, escrowLockTestData.accepted, escrowLockTestData.memo]);
        escrowLockRes.expectJson();
        escrowLockRes.expectStatusCode(200);
        const result = escrowLockRes.getBody();

        // TODO: Need to add more test cases after broadcast functionality will be done
    });

});
