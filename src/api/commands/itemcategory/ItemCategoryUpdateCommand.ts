// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { ListingItemService } from '../../services/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategoryUpdateRequest } from '../../requests/ItemCategoryUpdateRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { NotFoundException } from '../../exceptions/NotFoundException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import * as resources from 'resources';

export class ItemCategoryUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;
    public name: string;
    public helpStr: string;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService
    ) {
        super(Commands.CATEGORY_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * updates user defined category
     *
     * data.params[]:
     *  [0]: category id
     *  [1]: category name
     *  [2]: description
     *  [3]: parentItemCategoryId
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {

        const categoryId = data.params[0];
        const name = data.params[1];
        const description = data.params[2];
        const parentItemCategoryId = data.params[3] || 'cat_ROOT';

        return await this.itemCategoryService.update(categoryId, {
            name,
            description,
            parent_item_category_id: parentItemCategoryId
        } as ItemCategoryUpdateRequest);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('categoryId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('categoryName');
        } else if (data.params.length < 3) {
            throw new MissingParamException('description');
        }

        const categoryId = data.params[0];
        if (typeof categoryId !== 'number' || categoryId <= 0) {
            throw new InvalidParamException('categoryId', 'number');
        }

        const categoryName = data.params[1];
        if (typeof categoryName !== 'string') {
            throw new InvalidParamException('categoryName', 'string');
        }

        const description = data.params[2];
        if (typeof description !== 'string') {
            throw new InvalidParamException('description', 'string');
        }

        if (data.params.length >= 4) {
            const parentItemCategoryId = data.params[3];
            if (typeof parentItemCategoryId !== 'number' || parentItemCategoryId <= 0) {
                throw new InvalidParamException('parentItemCategoryId', 'number');
            }
        }

        // Throws NotFoundException
        const itemCategoryModel = await this.itemCategoryService.findOne(categoryId);
        const itemCategory: resources.ItemCategory = itemCategoryModel.toJSON();
        if (itemCategory.key != null) {
            // Non-default categories don't have category keys currently
            throw new MessageException(`Default category can't be updated or deleted.`);
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
