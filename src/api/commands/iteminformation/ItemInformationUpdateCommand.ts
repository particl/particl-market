// Copyright (c) 2017-2020, The Particl Market developers
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
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';

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

        let category;
        if (!_.isEmpty(itemCategory)) {
            category = {
                key: itemCategory.key
            } as ItemCategoryUpdateRequest;
        }

        return this.itemInformationService.update(listingItemTemplate.ItemInformation.id, {
            title: data.params[1],
            shortDescription: data.params[2],
            longDescription: data.params[3],
            itemCategory: category
        } as ItemInformationUpdateRequest);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplateId
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: categoryId (optional)
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
        }

        const listingItemTemplateId = data.params[0];   // required
        const title = data.params[1];                   // required
        const shortDescription = data.params[2];        // required
        const longDescription = data.params[3];         // required
        const categoryId = data.params[4];              // optional

        if (typeof listingItemTemplateId !== 'number') {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        } else if (typeof title !== 'string') {
            throw new InvalidParamException('title', 'string');
        } else if (typeof shortDescription !== 'string') {
            throw new InvalidParamException('shortDescription', 'string');
        } else if (typeof longDescription !== 'string') {
            throw new InvalidParamException('longDescription', 'string');
        } else if (!_.isNil(categoryId) && typeof categoryId !== 'number') {
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
        if (!_.isNil(categoryId)) {
            const itemCategory: resources.ItemCategory = await this.itemCategoryService.findOne(data.params[4])
                .then(value => {
                    return value.toJSON();
                })
                .catch(reason => {
                    throw new ModelNotFoundException('ItemCategory');
                });
            data.params[4] = itemCategory;
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        data.params[0] = listingItemTemplate;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemTemplateId> <title> <shortDescription> <longDescription> [categoryId] ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - string, The ID of the ListingItemTemplate which ItemInformation we want to update. \n'
            + '    <title>                       - string, The title for the ItemInformation. \n'
            + '    <shortDescription>            - string, The short description for the ItemInformation. \n'
            + '    <longDescription>             - string, The long description for the ItemInformation. \n'
            + '    <categoryId>                  - number, optional - The ID of the ItemCategory for the ItemInformation.';
    }

    public description(): string {
        return 'Update the item details of an ItemInformation.';
    }

    public example(): string {
        return 'information ' + this.getName() + ' 1 Cigarettes \'Cigarette packet\' \'COUGHING NAILS -- when you\\\'ve just got to have a cigarette.\' 76';
    }
}
