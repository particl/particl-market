// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { MarketType } from '../../../src/api/enums/MarketType';
import { PrivateKey, Networks } from 'particl-bitcore-lib';
import {MissingParamException} from '../../../src/api/exceptions/MissingParamException';
import {ModelNotFoundException} from '../../../src/api/exceptions/ModelNotFoundException';

describe('ItemCategoryGetCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);

    const randomBoolean: boolean = Math.random() >= 0.5;
    const testUtil = new BlackBoxTestUtil(randomBoolean ? 0 : 1);

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryGetCommand = Commands.CATEGORY_GET.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;

    let market: resources.Market;
    let profile: resources.Profile;
    let rootCategory: resources.ItemCategory;

    beforeAll(async () => {
        await testUtil.cleanDb();

        profile = await testUtil.getDefaultProfile();
        expect(profile.id).toBeDefined();
        market = await testUtil.getDefaultMarket(profile.id);
        expect(market.id).toBeDefined();

        const res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        rootCategory = res.getBody()['result'];

    });


    test('Should fail because missing id', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryId').getMessage());
    });


    test('Should fail because invalid id', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand,
            true
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryId', 'number').getMessage());
    });


    test('Should fail because ItemCategory not found', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new ModelNotFoundException('ItemCategory').getMessage());
    });


    test('Should find default root ItemCategory by id', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryGetCommand,
            rootCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];

        expect(result.key).toBeDefined();
        expect(result.name).toBe('ROOT');
        expect(result.market).toBeNull();
        expect(result.ParentItemCategory).not.toBeDefined();
    });

});
