// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands} from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import * as resources from "resources";
import {MarketType} from '../../../src/api/enums/MarketType';
import {InvalidParamException} from '../../../src/api/exceptions/InvalidParamException';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';

describe('MarketAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const marketCommand = Commands.MARKET_ROOT.commandName;
    const marketAddCommand = Commands.MARKET_ADD.commandName;

    let defaultProfile: resources.Profile;

    beforeAll(async () => {
        await testUtil.cleanDb();

        defaultProfile = await testUtil.getDefaultProfile();

    });

    const marketData = {
        name: 'Test Market',
        type: MarketType.MARKETPLACE,
        receiveKey: 'receiveKey',
        receiveAddress: 'receiveAddress',
        publishKey: 'publishKey',
        publishAddress: 'publishAddress'
    };

    test('Should fail to create Market because missing profileId', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('profileId').getMessage());
    });

    test('Should fail to create Market because missing name', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('name').getMessage());
    });

    test('Should fail to create Market because missing type', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('type').getMessage());
    });

    test('Should fail to create Market because missing receiveKey', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            marketData.type
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('receiveKey').getMessage());
    });

    test('Should fail to create Market because missing receiveAddress', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            marketData.type,
            marketData.receiveKey
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('receiveAddress').getMessage());
    });

    test('Should fail to create Market because missing publishAddress', async () => {
        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            marketData.type,
            marketData.receiveKey,
            marketData.receiveAddress,
            marketData.publishKey
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('publishAddress').getMessage());
    });

    test('Should fail to create Market because invalid profileId', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketAddCommand,
            'INVALID',
            marketData.name,
            marketData.type,
            marketData.receiveKey,
            marketData.receiveAddress,
            marketData.publishKey,
            marketData.publishAddress
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('profileId', 'number').getMessage());
    });

    test('Should fail to create Market because invalid name', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            0,
            marketData.type,
            marketData.receiveKey,
            marketData.receiveAddress,
            marketData.publishKey,
            marketData.publishAddress
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('name', 'string').getMessage());
    });

    test('Should fail to create Market because invalid type', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            0,
            marketData.receiveKey,
            marketData.receiveAddress,
            marketData.publishKey,
            marketData.publishAddress
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('type', 'string').getMessage());
    });

    test('Should fail to create Market because invalid type', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            'INVALID',
            marketData.receiveKey,
            marketData.receiveAddress,
            marketData.publishKey,
            marketData.publishAddress
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('type', 'MarketType').getMessage());
    });

    test('Should fail to create Market because invalid receiveKey', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            marketData.type,
            0,
            marketData.receiveAddress,
            marketData.publishKey,
            marketData.publishAddress
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('receiveKey', 'string').getMessage());
    });

    test('Should fail to create Market because invalid receiveAddress', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            marketData.type,
            marketData.receiveKey,
            0,
            marketData.publishKey,
            marketData.publishAddress
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('receiveAddress', 'string').getMessage());
    });

    test('Should fail to create Market because invalid publishKey', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            marketData.type,
            marketData.receiveKey,
            marketData.receiveAddress,
            true,
            marketData.publishAddress
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('publishKey', 'string').getMessage());
    });

    test('Should fail to create Market because invalid publishAddress', async () => {

        const res: any = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            marketData.type,
            marketData.receiveKey,
            marketData.receiveAddress,
            marketData.publishKey,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('publishAddress', 'string').getMessage());
    });

    test('Should create a new market', async () => {

        const res = await testUtil.rpc(marketCommand, [marketAddCommand,
            defaultProfile.id,
            marketData.name,
            marketData.type,
            marketData.receiveKey,
            marketData.receiveAddress,
            marketData.publishKey,
            marketData.publishAddress
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.Market = res.getBody()['result'];
        expect(result.name).toBe(marketData.name);
        expect(result.type).toBe(marketData.type);
        expect(result.receiveKey).toBe(marketData.receiveKey);
        expect(result.receiveAddress).toBe(marketData.receiveAddress);
        expect(result.publishKey).toBe(marketData.publishKey);
        expect(result.publishAddress).toBe(marketData.publishAddress);
    });


});
