// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategoryCreateRequest } from '../../requests/ItemCategoryCreateRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { NotFoundException } from '../../exceptions/NotFoundException';

export class ItemCategoryAddCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService
    ) {
        super(Commands.CATEGORY_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * creates a new user defined category, these don't have a key and they always need to have a parent_item_category_id
     *
     * data.params[]:
     *  [0]: category name
     *  [1]: description
     *  [2]: parent_item_category_id id/key
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {
        const parentItemCategory = data.params[2];
        const parentItemCategoryId = await this.itemCategoryService.getCategoryIdByKey(parentItemCategory);
        return await this.itemCategoryService.create({
            name: data.params[0],
            description: data.params[1],
            parent_item_category_id: parentItemCategoryId
        } as ItemCategoryCreateRequest);
    }

    /**
     * - should have 3 params
     * - ...
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('categoryName');
        }
        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('categoryName', 'string');
        }
        if (data.params.length < 2) {
            throw new MissingParamException('description');
        }
        if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('description', 'string');
        }
        if (data.params.length < 3) {
            throw new MissingParamException('parentItemCategoryId|parentItemCategoryKey');
        }

        let parentItemCategoryId;
        if (typeof data.params[2] === 'string') {
            const parentItemCategoryKey = data.params[2];
            parentItemCategoryId = await this.itemCategoryService.getCategoryIdByKey(parentItemCategoryKey);
        } else if (typeof data.params[2] === 'number') {
            parentItemCategoryId = data.params[2];
        } else {
            throw new InvalidParamException('parentItemCategoryId|parentItemCategoryKey', 'number|string');
        }
        // Throws NotFoundException
        const parentItemCategoryModel = await this.itemCategoryService.findOne(parentItemCategoryId);

        return data;
    }

    public usage(): string {
        return this.getName() + ' <categoryName> <description> (<parentItemCategoryId>|<parentItemCategoryKey>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryName>                - String - The name of the category to create. \n'
            + '    <description>                 - String - A description of the category to \n'
            + '                                     create. \n'
            + '    <parentItemCategoryId>        - Numeric - The ID of the parent category of the \n'
            + '                                     category we\'re creating. \n'
            + '    <parentItemCategoryKey>       - String - The identifying key of the parent \n'
            + '                                     category of the category we\'re creating. ';
    }

    public description(): string {
        return 'Command for adding an item category.';
    }

    public example(): string {
        return 'category ' + this.getName() + ' newCategory \'description of the new category\' cat_wholesale_other ';
    }
}
