// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';

describe('EscrowReleaseCommand', () => {

    const testUtil = new BlackBoxTestUtil();

    beforeAll( async () => {
        await testUtil.cleanDb();

    });

    test('TODO: the command is tested in the BuyFlow suite', async () => {
        // TODO: the escrow is tested in the buyflow
    });

});
