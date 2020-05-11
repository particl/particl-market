// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';

describe('ItemCategoryAddCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;

    let market: resources.Market;
    let profile: resources.Profile;
    let parentCategory: resources.ItemCategory;

    const categoryData = {
        name: 'Sample Category 1',
        description: 'Sample Category Description 1'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        market = await testUtil.getDefaultMarket();
        profile = await testUtil.getDefaultProfile();

        // todo: test with existing category, not a custom one
        const res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        parentCategory = res.getBody()['result'];

    });

    test('Should fail to create the ItemCategory because missing marketId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('marketId').getMessage());
    });

    test('Should fail to create the ItemCategory because missing categoryName', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('categoryName').getMessage());
    });

    test('Should fail to create the ItemCategory because missing description', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('description').getMessage());
    });

    test('Should fail to create the ItemCategory because missing parentCategoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            categoryData.description
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('parentItemCategoryId|parentItemCategoryKey').getMessage());
    });

    test('Should fail to create the ItemCategory because non-existing parentCategoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            categoryData.description,
            0
        ]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new NotFoundException(0).getMessage());
    });

    test('Should fail to create the ItemCategory because invalid parentCategoryId', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            categoryData.description,
            'INVALID'
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('parentItemCategoryId', 'number').getMessage());
    });

    test('Should fail to create the ItemCategory because invalid categoryName', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            1234567890,
            categoryData.description,
            parentCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('categoryName', 'string').getMessage());
    });

    test('Should fail to create the ItemCategory because invalid description', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            1234567890,
            parentCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(400);
        expect(res.error.error.message).toBe(new InvalidParamException('description', 'string').getMessage());
    });

    test('Should create the ItemCategory under parentCategory', async () => {
        const res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            categoryData.description,
            parentCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);

        const result: resources.ItemCategory = res.getBody()['result'];
        expect(result.name).toBe(categoryData.name);
        expect(result.description).toBe(categoryData.description);
        expect(result.ParentItemCategory.id).toBe(parentCategory.id);
    });

});
