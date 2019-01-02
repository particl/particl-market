// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/ItemCategoryService';
import { ListingItemService } from '../../services/ListingItemService';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplateSearchParams } from '../../requests/ListingItemTemplateSearchParams';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { SearchOrder } from '../../enums/SearchOrder';
import * as _ from 'lodash';
import { ListingItemSearchParams } from '../../requests/ListingItemSearchParams';

export class ItemCategoryRemoveCommand extends BaseCommand implements RpcCommandInterface<void> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.ListingItemService) private listingItemService: ListingItemService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.CATEGORY_REMOVE);
        this.log = new Logger(__filename);
    }

    /**
     * remove user defined category
     * data.params[]:
     *  [0]: category id
     *
     * @param data
     * @returns {Promise<void>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<void> {

        if (!data.params[0]) {
            throw new MessageException('Missing categoryId.');
        }
        const categoryId = data.params[0];

        await this.itemCategoryService.findOne(categoryId)
            .then(value => {
                const itemCategory = value.toJSON();
                if (itemCategory.key) {
                    throw new MessageException('Default Category cant be removed.');
                }
            })
            .catch(reason => {
                throw new MessageException('Invalid categoryId.');
            });

        // check listingItemTemplate related with category
        await this.listingItemTemplateService.search({
            page: 0,
            pageLimit: 10,
            order: SearchOrder.ASC,
            category: categoryId
        } as ListingItemTemplateSearchParams)
            .then(values => {
                const listingItemTemplates = values.toJSON();
                if (listingItemTemplates.length > 0) {
                    throw new MessageException(`Category associated with ListingItemTemplate can't be deleted. id= ${categoryId}`);
                }
            });

        // check listingItem related with category
        await this.listingItemService.search({
            page: 0,
            pageLimit: 10,
            order: SearchOrder.ASC,
            category: categoryId
        } as ListingItemSearchParams)
            .then(values => {
                this.log.debug('values:', JSON.stringify(values, null, 2));
                const listingItems = values.toJSON();
                if (listingItems.length > 0) {
                    throw new MessageException(`Category associated with ListingItem can't be deleted. id= ${categoryId}`);
                }
            });


        return await this.itemCategoryService.destroy(categoryId);
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
