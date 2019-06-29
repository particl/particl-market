// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategoryCreateRequest } from '../../requests/model/ItemCategoryCreateRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ItemCategoryAddCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService
    ) {
        super(Commands.CATEGORY_ADD);
        this.log = new Logger(__filename);
    }

    /**
     * creates a new user defined category, these don't have a key and they always need to have a parent_item_category_id
     *
     * data.params[]:
     *  [0]: categoryName
     *  [1]: description
     *  [2]: parentItemCategory: resources.ItemCategory
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {

        const parentItemCategory: resources.ItemCategory = data.params[2];

        return await this.itemCategoryService.create({
            name: data.params[0],
            description: data.params[1],
            parent_item_category_id: parentItemCategory.id
        } as ItemCategoryCreateRequest);
    }

    /**
     * data.params[]:
     *  [0]: categoryName
     *  [1]: description
     *  [2]: parentItemCategoryId
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('categoryName');
        } else if (data.params.length < 2) {
            throw new MissingParamException('description');
        } else if (data.params.length < 3) {
            throw new MissingParamException('parentItemCategoryId|parentItemCategoryKey');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('categoryName', 'string');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('description', 'string');
        } else if (typeof data.params[2] !== 'number') {
            throw new InvalidParamException('parentItemCategoryId', 'number');
        }

        data.params[2] = await this.itemCategoryService.findOne(data.params[2]).then(value => value.toJSON());

        return data;
    }

    public usage(): string {
        return this.getName() + ' <categoryName> <description> <parentItemCategoryId> ';
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
