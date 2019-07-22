// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategoryUpdateRequest } from '../../requests/model/ItemCategoryUpdateRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ItemCategoryUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService
    ) {
        super(Commands.CATEGORY_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * updates user defined category
     *
     * data.params[]:
     *  [0]: category: resources.ItemCategory
     *  [1]: categoryName
     *  [2]: description
     *  [3]: parentItemCategory: resources.ItemCategory
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {

        const category: resources.ItemCategory = data.params[0];
        const name = data.params[1];
        const description = data.params[2];
        const parentItemCategory: resources.ItemCategory = data.params[3];

        return await this.itemCategoryService.update(category.id, {
            name,
            description,
            parent_item_category_id: parentItemCategory.id
        } as ItemCategoryUpdateRequest);
    }

    /**
     *  [0]: categoryId
     *  [1]: categoryName
     *  [2]: description
     *  [3]: parentCategoryId
     *
     * - should have 4 params
     * - if category has key, it cant be edited
     * - ...
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('categoryId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('categoryName');
        } else if (data.params.length < 3) {
            throw new MissingParamException('description');
        }

        if (typeof data.params[0] !== 'number' || data.params[0] <= 0) {
            throw new InvalidParamException('categoryId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('categoryName', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('description', 'string');
        }

        const itemCategory: resources.ItemCategory = await this.itemCategoryService.findOne(data.params[0]).then(value => value.toJSON());
        data.params[0] = itemCategory;

        if (data.params.length > 3) {
            if (typeof data.params[3] !== 'number' || data.params[3] <= 0) {
                throw new InvalidParamException('parentCategoryId', 'number');
            }
            data.params[3] = await this.itemCategoryService.findOne(data.params[3]).then(value => value.toJSON());
        } else {
            data.params[3] = await this.itemCategoryService.findRoot().then(value => value.toJSON());
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <categoryId> <categoryName> <description> [<parentItemCategoryId>] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID of the category we want to \n'
            + '                                     update. \n'
            + '    <categoryName>                - String - The new name of the category we want \n'
            + '                                     to update. \n'
            + '    <description>                 - String - The new description of the category \n'
            + '                                     we want to update. \n'
            + '    <parentItemCategoryId>        - [optional] Numeric - The ID that identifies the \n'
            + '                                     new parent category of the category we want to \n'
            + '                                     update; default is the root category. ';
    }

    public description(): string {
        return 'Update the details of an item category given by categoryId.';
    }

    public example(): string {
        return 'category ' + this.getName() + ' 81 updatedCategory \'Updated category description\' 80 ';
    }


}
