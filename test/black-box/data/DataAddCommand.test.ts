// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { CreatableModel } from '../../../src/api/enums/CreatableModel';
import { Logger as LoggerType } from '../../../src/core/Logger';
import {NotImplementedException} from '../../../src/api/exceptions/NotImplementedException';
import {InvalidParamException} from '../../../src/api/exceptions/InvalidParamException';

describe('DataAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const dataCommand = Commands.DATA_ROOT.commandName;
    const dataAddCommand =  Commands.DATA_ADD.commandName;

    beforeAll(async () => {
        await testUtil.cleanDb();

    });

    const testProfileData = {
        name: 'test-profile',
        address: 'test-address'
    };

    test('Should fail to create test data for Profile due to invalid model', async () => {
        const res = await testUtil.rpc(dataCommand, [dataAddCommand,
            'INVALID',
            JSON.stringify(testProfileData)
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('model', 'CreatableModel').getMessage());
    });

    test('Should fail to create test data for Profile due to invalid json', async () => {
        const res = await testUtil.rpc(dataCommand, [dataAddCommand,
            CreatableModel.PROFILE,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('json', 'string').getMessage());
    });

    test('Should fail to create test data for Profile due to invalid withRelated', async () => {
        const res = await testUtil.rpc(dataCommand, [dataAddCommand,
            CreatableModel.PROFILE,
            JSON.stringify(testProfileData),
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('withRelated', 'boolean').getMessage());
    });

    test('Should create test data for Profile', async () => {
        const res = await testUtil.rpc(dataCommand, [dataAddCommand,
            CreatableModel.PROFILE,
            JSON.stringify(testProfileData)]
        );
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.name).toBe(testProfileData.name);
        expect(result.address).toBe(testProfileData.address);
    });

});

