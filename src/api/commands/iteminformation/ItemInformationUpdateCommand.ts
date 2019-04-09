// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemInformationService } from '../../services/model/ItemInformationService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemInformationUpdateRequest } from '../../requests/ItemInformationUpdateRequest';
import { ItemInformation } from '../../models/ItemInformation';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';

export class ItemInformationUpdateCommand extends BaseCommand implements RpcCommandInterface<ItemInformation> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemInformationService) private itemInformationService: ItemInformationService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) private listingItemTemplateService: ListingItemTemplateService
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
        return this.updateWithCheckListingTemplate({
            listing_item_template_id: data.params[0],
            title: data.params[1],
            shortDescription: data.params[2],
            longDescription: data.params[3],
            itemCategory: {
                id: data.params[4]
            }
        } as ItemInformationUpdateRequest);
    }

    // TODO: WTF FIX
    public async updateWithCheckListingTemplate(@request(ItemInformationUpdateRequest) body: ItemInformationUpdateRequest): Promise<ItemInformation> {
        const listingItemTemplateId = body.listing_item_template_id;
        const listingItemTemplate = await this.listingItemTemplateService.findOne(listingItemTemplateId);
        const itemInformation = listingItemTemplate.related('ItemInformation').toJSON() || {};
        if (_.isEmpty(itemInformation)) {
            this.log.warn(`ItemInformation with the id=${listingItemTemplateId} not related with any listing-item-template!`);
            throw new MessageException(`ItemInformation with the id=${listingItemTemplateId} not related with any listing-item-template!`);
        }
        return this.itemInformationService.update(itemInformation.id, body);
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
        if (data.params.length < 5) {
            this.log.error('Not enough args.');
            throw new MessageException('Not enough args.');
        } else if (typeof data.params[0] !== 'number') {
            this.log.error('ListingItemTemplate ID must be numeric.');
            throw new MessageException('ListingItemTemplate ID must be numeric.');
        } else if (typeof data.params[4] !== 'number') {
            this.log.error('Category ID must be numeric.');
            throw new MessageException('Category ID must be numeric.');
        }
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
