// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { rpc, api } from '../lib/api';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { GenerateListingItemParams } from '../../../src/api/requests/params/GenerateListingItemParams';
import { GenerateBidParams } from '../../../src/api/requests/params/GenerateBidParams';
import { GenerateOrderParams } from '../../../src/api/requests/params/GenerateOrderParams';
import { TestDataGenerateRequest } from '../../../src/api/requests/TestDataGenerateRequest';
import * as resources from 'resources';

// Ryno
import { BidMessageType } from '../../../src/api/enums/BidMessageType';
import { AddressType } from '../../../src/api/enums/AddressType';
import { EscrowType } from '../../../src/api/enums/EscrowType';
import { OrderStatus } from '../../../src/api/enums/OrderStatus';
import { ImageDataProtocolType } from '../../../src/api/enums/ImageDataProtocolType';

import { MessageException } from '../../../src/api/exceptions/MessageException';
import { GenerateListingItemTemplateParams } from '../../../src/api/requests/params/GenerateListingItemTemplateParams';

import { SearchOrder } from '../../../src/api/enums/SearchOrder';

describe('OrderItemStatusCommand', () => {

    const testUtil = new BlackBoxTestUtil(); // (randomBoolean ? 1 : 2);  // SELLER

    const escrowCommand = Commands.ESCROW_ROOT.commandName;
    const escrowLockSubCommand = Commands.ESCROW_LOCK.commandName;

    beforeAll(async () => {
        jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

        // TODO: the escrow is tested in the buyflow
    });

    test('Should fail Escrow Lock because missing params', async () => {
        const escrowLockRes = await testUtil.rpc(escrowCommand, [
            escrowLockSubCommand
        ]);

        escrowLockRes.expectJson();
        escrowLockRes.expectStatusCode(500);
    });

    test('Should fail Escrow Lock because non-existent bid', async () => {
        const escrowLockRes = await testUtil.rpc(escrowCommand, [
            escrowLockSubCommand,
            'someFakeHash'
        ]);

        escrowLockRes.expectJson();
        escrowLockRes.expectStatusCode(404);
    });

    test('Should fail Escrow Lock because non-existent bid', async () => {
        const escrowLockRes = await testUtil.rpc(escrowCommand, [
            escrowLockSubCommand,
            1234
        ]);

        escrowLockRes.expectJson();
        escrowLockRes.expectStatusCode(404);
    });

});
