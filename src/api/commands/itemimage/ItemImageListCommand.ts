// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemTemplate } from '../../models/ListingItemTemplate';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MessageException } from '../../exceptions/MessageException';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ItemImageListCommand extends BaseCommand implements RpcCommandInterface<resources.ItemImage[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.ITEMIMAGE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplate: resources.ListingItemTemplate
     *    or listingItem: resources.ListingItem
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.ItemImage[]> {
        return data.params[1].ItemInformation.ItemImages;
    }

    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplateId or listingItemId
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('template/item');
        } else if (data.params.length < 2) {
            throw new MissingParamException('listingItemTemplateId/listingItemId');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('template/item', 'string');
        }

        const typeSpecifier = data.params[0];
        if (typeSpecifier === 'template') {
            if (typeof data.params[1] !== 'number') {
                throw new InvalidParamException('listingItemTemplateId', 'number');
            }

            // make sure required data exists and fetch it
            data.params[1] = await this.listingItemTemplateService.findOne(data.params[1])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItemTemplate');
                });

        } else if (typeSpecifier === 'item') {
            if (typeof data.params[1] !== 'number') {
                throw new InvalidParamException('listingItemId', 'number');
            }

            // make sure required data exists and fetch it
            data.params[1] = await this.listingItemService.findOne(data.params[1])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItem');
                });

        } else {
            throw new InvalidParamException('typeSpecifier', 'template/item');
        }
        return data;
    }

    public usage(): string {
        return this.getName() + ' (template <listingItemTemplateId>|item <listingItemId>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemTemplateId>       - Numeric - The ID of the listing item template whose images we want to list. \n'
            + '    <listingItemId>               - Numeric - The ID of the listing item whose images we want to list. ';
    }

    public description(): string {
        return 'Return all Images for ListingItem or ListingItemTemplate.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' template 1 ';
    }
}
