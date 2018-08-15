// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { ListingItem, ListingItemTemplate } from 'resources';

describe('EscrowRefundCommand', () => {

    const testUtil = new BlackBoxTestUtil();

    beforeAll( async () => {
        await testUtil.cleanDb();

    });

    test('TODO: the command is tested in the BuyFlow suite', async () => {
        // TODO: the escrow is tested in the buyflow
    });

});
