// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * from 'jest';
import * as resources from 'resources';
import { BlackBoxTestUtil } from '../lib/BlackBoxTestUtil';
import { Commands } from '../../../src/api/commands/CommandEnumType';
import { Logger as LoggerType } from '../../../src/core/Logger';
import { MissingParamException } from '../../../src/api/exceptions/MissingParamException';

describe('ItemCategorySearchCommand', () => {

    jasmine.DEFAULT_TIMEOUT_INTERVAL = process.env.JASMINE_TIMEOUT;

    const log: LoggerType = new LoggerType(__filename);
    const testUtil = new BlackBoxTestUtil();

    const categoryCommand = Commands.CATEGORY_ROOT.commandName;
    const categorySearchCommand = Commands.CATEGORY_SEARCH.commandName;
    const categoryListCommand = Commands.CATEGORY_LIST.commandName;
    const categoryAddCommand = Commands.CATEGORY_ADD.commandName;

    let market: resources.Market;
    let profile: resources.Profile;

    let rootCategory: resources.ItemCategory;
    let customCategory: resources.ItemCategory;

    const categoryData = {
        name: 'Sample Category 1',
        description: 'Sample Category Description 1'
    };

    beforeAll(async () => {
        await testUtil.cleanDb();

        market = await testUtil.getDefaultMarket();
        profile = await testUtil.getDefaultProfile();

        // first get the rootCategory
        let res = await testUtil.rpc(categoryCommand, [categoryListCommand]);
        res.expectJson();
        res.expectStatusCode(200);
        rootCategory = res.getBody()['result'];

        // create a custom category
        res = await testUtil.rpc(categoryCommand, [categoryAddCommand,
            market.id,
            categoryData.name,
            categoryData.description,
            rootCategory.id
        ]);
        res.expectJson();
        res.expectStatusCode(200);
        customCategory = res.getBody()['result'];

        expect(customCategory.ParentItemCategory.id).toBe(rootCategory.id);

        log.debug('createdCategory.id: ', customCategory.id);
        log.debug('rootCategory.id: ', rootCategory.id);

    });

    test('Should find ItemCategories, when searchBy string matches', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand, 'Sample']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: resources.ItemCategory[] = res.getBody()['result'];
        expect(result.length).not.toBe(0);
        expect(result[0].name).toBe(categoryData.name);
        expect(result[0].description).toBe(categoryData.description);

    });

    test('Should fail to searchBy ItemCategories because missing searchBy string', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand]);
        res.expectJson();
        res.expectStatusCode(404);
        expect(res.error.error.message).toBe(new MissingParamException('searchBy').getMessage());
    });

    test('Should not find any ItemCategories when the searchBy string doesnt match', async () => {
        const res = await testUtil.rpc(categoryCommand, [categorySearchCommand, 'NOTFOUNDCATEGORY']);
        res.expectJson();
        res.expectStatusCode(200);
        const result: any = res.getBody()['result'];
        expect(result.length).toBe(0);
    });
});
