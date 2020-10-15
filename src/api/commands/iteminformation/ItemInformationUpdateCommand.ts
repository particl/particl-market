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
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';
import { ItemCategoryUpdateRequest } from '../../requests/model/ItemCategoryUpdateRequest';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { ModelNotModifiableException } from '../../exceptions/ModelNotModifiableException';
import { CommandParamValidationRules, IdValidationRule, ParamValidationRule, StringValidationRule } from '../CommandParamValidation';
import { MessageException } from '../../exceptions/MessageException';


export class ItemInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMINFORMATION_UPDATE);
        this.log = new Logger(__filename);

        this.debug = true;
    }

    public getCommandParamValidationRules(): CommandParamValidationRules {
        return {
            params: [
                new IdValidationRule('listingItemTemplateId', true, this.listingItemTemplateService),
                new StringValidationRule('title', true),
                new StringValidationRule('shortDescription', true, undefined,
                    async (value, index, allValues) => {
                        if (value.length > 500) {   // todo: check
                            throw new InvalidParamException('shortDescription');
                        }
                        return true;
                    }),
                new StringValidationRule('longDescription', true),
                new IdValidationRule('itemCategoryId', false, this.itemCategoryService)
            ] as ParamValidationRule[]
        } as CommandParamValidationRules;
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: itemCategory: resources.ItemCategory, optional
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemInformation> {
        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];  // required
        const title = data.params[1];                                               // required
        const shortDescription = data.params[2];                                    // required
        const longDescription = data.params[3];                                     // required
        const itemCategory: resources.ItemCategory = data.params[4];                // optional

        return this.itemInformationService.update(listingItemTemplate.ItemInformation.id, {
            title,
            shortDescription,
            longDescription,
            itemCategory: !_.isEmpty(itemCategory) ? {
                key: itemCategory.key,
                market: itemCategory.market
            } as ItemCategoryUpdateRequest : undefined
        } as ItemInformationUpdateRequest);
    }

    /**
     * data.params[]:
     *  [0]: listingItemTemplate: resources.ListingItemTemplate
     *  [1]: title
     *  [2]: shortDescription
     *  [3]: longDescription
     *  [4]: itemCategory: resources.ItemCategory, optional
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        await super.validate(data);

        const listingItemTemplate: resources.ListingItemTemplate = data.params[0];  // required
        const title = data.params[1];                                               // required
        const shortDescription = data.params[2];                                    // required
        const longDescription = data.params[3];                                     // required
        const itemCategory: resources.ItemCategory = data.params[4];                    // optional

        // make sure ItemInformation exists
        if (_.isEmpty(listingItemTemplate.ItemInformation)) {
            throw new ModelNotFoundException('ItemInformation');
        }

        const isModifiable = await this.listingItemTemplateService.isModifiable(listingItemTemplate.id);
        if (!isModifiable) {
            throw new ModelNotModifiableException('ListingItemTemplate');
        }

        this.log.debug('itemCategory: ', JSON.stringify(itemCategory, null, 2));
        this.log.debug('listingItemTemplate.market: ', JSON.stringify(listingItemTemplate.market, null, 2));

        // allow adding a default category to market template
        if ((!_.isNil(itemCategory) && !_.isNil(itemCategory.market) && !_.isNil(listingItemTemplate.market))
            && itemCategory.market !== listingItemTemplate.market) {
            throw new MessageException('ItemCategory market does not match the ListingItemTemplates market.');
        }

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
