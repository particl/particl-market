// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MessageException } from '../../../src/api/exceptions/MessageException';
import { NotFoundException } from '../../../src/api/exceptions/NotFoundException';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';
import { InvalidParamException } from '../../../src/api/exceptions/InvalidParamException';

describe('ItemCategorySearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categorySearchCommand = Commands.CATEGORY_SEARCH.commandName;

    const parentCategory = {
        id: 0,
        key: 'cat_high_real_estate'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        // create category
        const categoryData = {
            name: 'Sample Category 1',
            description: 'Sample Category Description 1',
            parent_item_category_id: 'cat_ROOT'
        };
        await testUtil.rpc(Commands.CATEGORY_ROOT.commandName, [
            Commands.CATEGORY_ADD.commandName,
            categoryData.name,
            categoryData.description,
            categoryData.parent_item_category_id
        ]);

    });

    test('Should find ItemCategories, when searchBy string matches', async () => {

        //  find categories
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand, 'Sample']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).not.toBe(0);
        // TODO: expect the previously inserted one
    });

    test('Should fail to searchBy iItemCategories because theres no searchBy string', async () => {
        //  find categories
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('searchString').getMessage());
    });

    test('Should fail to searchBy iItemCategories because theres no searchBy string', async () => {
        //  find categories
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand, null]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new InvalidParamException('searchString', 'string').getMessage());
    });

    test('Should find get any ItemCategories when the searchBy string doesnt match', async () => {
        //  find categories
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand, 'NOTFOUNDCATEGORY']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });
});
