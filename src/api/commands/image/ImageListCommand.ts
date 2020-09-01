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
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ImageListCommand extends BaseCommand implements RpcCommandInterface<resources.Image[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.IMAGE_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplate: resources.ListingItemTemplate
     *    or listingItem: resources.ListingItem
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.Image[]> {
        return data.params[1].ItemInformation.Images;
    }

    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplateId or listingItemId
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        // make sure the required params exist
        if (data.params.length < 1) {
            throw new MissingParamException('template|item');
        } else if (data.params.length < 2) {
            throw new MissingParamException('id');
        }

        // make sure the params are of correct type
        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('template|item', 'string');
        }

        if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('id', 'number');
        }

        const typeSpecifier = data.params[0];
        if (typeSpecifier === 'template') {

            // make sure required data exists and fetch it
            data.params[1] = await this.listingItemTemplateService.findOne(data.params[1])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItemTemplate');
                });

        } else if (typeSpecifier === 'item') {

            // make sure required data exists and fetch it
            data.params[1] = await this.listingItemService.findOne(data.params[1])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItem');
                });

        } else {
            throw new InvalidParamException('typeSpecifier', 'template|item');
        }
        return data;
    }

    public usage(): string {
        return this.getName() + ' <template|item> <listingItemTemplateId|listingItemId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <id>         - number - The ID of the ListingItem or ListingItemTemplate which Images we want to list. \n';
    }

    public description(): string {
        return 'Return all Images for ListingItem or ListingItemTemplate.';
    }

    public example(): string {
        return 'image ' + this.getName() + ' template 1 ';
    }
}
