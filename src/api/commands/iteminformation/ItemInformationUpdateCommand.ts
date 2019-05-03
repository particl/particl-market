// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemInformationService } from '../../services/model/ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformationUpdateRequest } from '../../requests/model/ItemInformationUpdateRequest';
import { ItemInformation } from '../../models/ItemInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ItemCategoryUpdateRequest } from '../../requests/model/ItemCategoryUpdateRequest';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';

export class ItemInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMINFORMATION_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate, resources.ListingItemTemplate
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: itemCategory, resources.ItemCategory
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemInformation> {

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];
        const itemCategory: resources.ItemCategory = data.params[4];

        return this.itemInformationService.update(listingItemTemplate.ItemInformation.id, {
            listing_item_template_id: data.params[0].id,
            title: data.params[1],
            shortDescription: data.params[2],
            longDescription: data.params[3],
            itemCategory: {
                id: itemCategory.id
            } as ItemCategoryUpdateRequest
        } as ItemInformationUpdateRequest);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: categoryId
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        } else if (data.params.length < 2) {
            throw new MissingParamException('title');
        } else if (data.params.length < 3) {
            throw new MissingParamException('shortDescription');
        } else if (data.params.length < 4) {
            throw new MissingParamException('longDescription');
        } else if (data.params.length < 5) {
            throw new MissingParamException('categoryId');
        }

        if (typeof data.params[0] !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof data.params[1] !== 'string') {
            throw new InvalidParamException('title', 'string');
        } else if (typeof data.params[2] !== 'string') {
            throw new InvalidParamException('shortDescription', 'string');
        } else if (typeof data.params[3] !== 'string') {
            throw new InvalidParamException('longDescription', 'string');
        } else if (typeof data.params[4] !== 'number') {
            throw new InvalidParamException('categoryId', 'number');
        }

        // make sure ListingItemTemplate with the id exists
        const listingItemTemplate: resources.ListingItemTemplate = await this.listingItemTemplateService.findOne(data.params[0])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('ListingItemTemplate');
            });

        // make sure ItemInformation exists
        if (_.isEmpty(listingItemTemplate.ItemInformation)) {
            throw new ModelNotFoundException('ItemInformation');
        }

        // make sure ItemCategory with the id exists
        const itemCategory: resources.ItemCategory = await this.itemCategoryService.findOne(data.params[4])
            .then(value => {
                return value.toJSON();
            })
            .catch(reason => {
                throw new ModelNotFoundException('ItemCategory');
            });

        data.params[0] = listingItemTemplate;
        data.params[4] = itemCategory;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <title> <shortDescription> <longDescription> <categoryId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template \n'
            + '                                     whose associated item information we want to \n'
            + '                                     update. \n'
            + '    <title>                       - String - The new title of the item information \n'
            + '                                     we\'re updating. \n'
            + '    <shortDescription>            - String - The new short description of the item \n'
            + '                                     information we\'re updating. \n'
            + '    <longDescription>             - String - The new long description of the item \n'
            + '                                     information we\'re updating. \n'
            + '    <categoryId>                  - String - The ID that identifies the new \n'
            + '                                     category we want to assign to the item \n'
            + '                                     information we\'re updating. ';
    }

    public description(): string {
        return 'Update the item details of an item information given by listingItemTemplateId.';
    }

    public example(): string {
        return 'information ' + this.getName() + ' 1 Cigarettes \'Cigarette packet\' \'COUGHING NAILS -- when you\\\'ve just got to have a cigarette.\' 76';
    }
}
