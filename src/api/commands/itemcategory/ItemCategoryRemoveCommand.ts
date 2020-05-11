// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { request, validate } from '../../../core/api/Validate';
import { Core, Targets, Types } from '../../../constants';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplateSearchParams } from '../../requests/search/ListingItemTemplateSearchParams';
import { Commands } from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SearchOrder } from '../../enums/SearchOrder';
import { ListingItemSearchParams } from '../../requests/search/ListingItemSearchParams';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { SearchOrderField } from '../../enums/SearchOrderField';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ItemCategoryRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.CATEGORY_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * remove user defined category
     * data.params[]:
     *  [0]: itemCategory: resources.ItemCategory
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {
        const category: resources.ItemCategory = data.params[0];
        return await this.itemCategoryService.destroy(category.id);
    }

    /**
     * data.params[]:
     *  [0]: categoryId
     *
     * @param data
     * @returns {Promise<void>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('categoryId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('categoryId', 'number');
        }
        const categoryId = data.params[0];

        const itemCategory: resources.ItemCategory = await this.itemCategoryService.findOne(categoryId)
            .then(value => {
                const category = value.toJSON();
                if (_.includes(category.key, 'cat_')) {
                    throw new MessageException('Default Category cant be removed.');
                }
                return category;
            })
            .catch(reason => {
                throw new ModelNotFoundException('ItemCategory');
            });

        data.params[0] = itemCategory;

        const searchParams = {
            page: 0,
            pageLimit: 10,
            order: SearchOrder.ASC,
            orderField: SearchOrderField.DATE,
            category: categoryId
        } as ListingItemTemplateSearchParams;

        this.log.debug('ListingItemTemplateSearchParams: ', JSON.stringify(searchParams, null, 2));

        // check listingItemTemplate related with category
        await this.listingItemTemplateService.search(searchParams)
            .then(values => {
                const listingItemTemplates = values.toJSON();
                if (listingItemTemplates.length > 0) {
                    throw new MessageException(`Category associated with ListingItemTemplate can't be deleted. id= ${categoryId}`);
                }
            });

        const defaultListingItemSearchParams = new ListingItemSearchParams();
        defaultListingItemSearchParams.profileId = '*';
        defaultListingItemSearchParams.category = categoryId;

        this.log.debug('ListingItemSearchParams: ', JSON.stringify(defaultListingItemSearchParams, null, 2));

        // check listingItem related with category
        await this.listingItemService.search(defaultListingItemSearchParams)
            .then(values => {
                const listingItems = values.toJSON();
                if (listingItems.length > 0) {
                    throw new MessageException(`Category associated with ListingItem can't be deleted. id= ${categoryId}`);
                }
            });

        return data;
    }

    public usage(): string {
        return this.getName() + ' <categoryId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID belonging to the category we \n'
            + '                                     want to destroy. ';
    }

    public description(): string {
        return 'Remove and destroy an item category via categoryId.';
    }

    public example(): string {
        return 'category ' + this.getName() + ' 81 ';
    }
}
