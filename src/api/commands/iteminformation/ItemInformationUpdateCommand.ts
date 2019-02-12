// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemInformationService } from '../../services/ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformationUpdateRequest } from '../../requests/ItemInformationUpdateRequest';
import { ItemInformation } from '../../models/ItemInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import * as _ from 'lodash';
import { ListingItemTemplateService } from '../../services/ListingItemTemplateService';
import { MessageException } from '../../exceptions/MessageException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ItemInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
    ) {
        super(Commands.ITEMINFORMATION_UPDATE);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listing template id
     *  [1]: title
     *  [2]: short-description
     *  [3]: long-description
     *  [4]: categoryId
     *
     * @param data
     * @returns {Promise<ItemInformation>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemInformation> {
        const listingItemTemplateId =  data.params[0];
        const title = data.params[1];
        const shortDescription = data.params[2];
        const longDescription = data.params[3];
        const categoryId = data.params[4];

        const listingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const itemInformation = listingItemTemplate.related('ItemInformation').toJSON() || {};
        if (_.isEmpty(itemInformation)) {
            throw new ModelNotFoundException(`ItemInformation with the id=${listingItemTemplateId} not related with any listing-item-template!`);
        }

        const requestBody = {
            listing_item_template_id: listingItemTemplateId,
            title,
            shortDescription,
            longDescription,
            itemCategory: {
                id: categoryId
            }
        } as ItemInformationUpdateRequest;
        return this.itemInformationService.update(itemInformation.id, requestBody);
    }

    /**
     * - should have 4 params
     * - if category has key, it cant be edited
     * - ...
     *
     * @param {RpcRequest} data
     * @returns {Promise<void>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('listingItemTemplateId');
        }
        if (data.params.length < 2) {
            throw new MissingParamException('title');
        }
        if (data.params.length < 3) {
            throw new MissingParamException('shortDescription');
        }
        if (data.params.length < 4) {
            throw new MissingParamException('longDescription');
        }
        if (data.params.length < 5) {
            throw new MissingParamException('categoryId');
        }

        const listingItemTemplateId =  data.params[0];
        if (typeof listingItemTemplateId !== 'number' || listingItemTemplateId <= 0) {
            throw new InvalidParamException('listingItemTemplateId', 'number');
        }

        const title = data.params[1];
        if (typeof title !== 'string') {
            throw new InvalidParamException('title', 'string');
        }

        const shortDescription = data.params[2];
        if (typeof shortDescription !== 'string') {
            throw new InvalidParamException('shortDescription', 'string');
        }

        const longDescription = data.params[3];
        if (typeof longDescription !== 'string') {
            throw new InvalidParamException('longDescription', 'string');
        }

        const categoryId = data.params[4];
        if (typeof categoryId !== 'number' || categoryId <= 0) {
            throw new InvalidParamException('categoryId', 'number');
        }

        // Throws NotFoundException
        const itemTemplate = this.itemInformationService.findByItemTemplateId(listingItemTemplateId);
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
