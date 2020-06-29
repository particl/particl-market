// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as _ from 'lodash';
import * as resources from 'resources';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ShippingDestination } from '../../models/ShippingDestination';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ShippingDestinationListCommand extends BaseCommand implements RpcCommandInterface<resources.ShippingDestination[]> {

    public log: LoggerType;

    constructor(
        @inject(Types.Service) @named(Targets.Service.model.ListingItemTemplateService) public listingItemTemplateService: ListingItemTemplateService,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService,
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType
    ) {
        super(Commands.SHIPPINGDESTINATION_LIST);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: resources.listingItemTemplate or resources.ListingItem
     *
     * @param data
     * @returns {Promise<resources.ShippingDestination[]>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<resources.ShippingDestination[]> {
        const itemOrTemplate: resources.ListingItemTemplate | resources.ListingItem = data.params[1];
        return (!_.isEmpty(itemOrTemplate.ItemInformation) && !_.isEmpty(itemOrTemplate.ItemInformation.ShippingDestinations))
            ? itemOrTemplate.ItemInformation.ShippingDestinations
            : [] as resources.ShippingDestination[];
    }

    /**
     * data.params[]:
     *  [0]: 'template' or 'item'
     *  [1]: listingItemTemplateId or listingItemId
     *
     * @param data
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('target');
        } else if (data.params.length < 2) {
            throw new MissingParamException('id');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('target', 'string');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('id', 'number');
        }

        data.params[0] = data.params[0].toLowerCase();

        if (data.params[0] === 'item' || data.params[0] === 'template') {
            if (data.params[0] === 'template') {
                // make sure ListingItemTemplate with the id exists
                data.params[1] = await this.listingItemTemplateService.findOne(data.params[1])
                    .then(value => value.toJSON())
                    .catch(reason => {
                        throw new ModelNotFoundException('ListingItemTemplate');
                    });
            } else if (data.params[0] === 'item') {
                // make sure ListingItem with the id exists
                data.params[1] = await this.listingItemService.findOne(data.params[1])
                    .then(value => value.toJSON())
                    .catch(reason => {
                        throw new ModelNotFoundException('ListingItem');
                    });
            }
        } else {
            throw new InvalidParamException('target', 'item|template');
        }

        return data;
    }

    public usage(): string {
        return this.getName() + ' <template|item> <listingItemTemplateId|listingItemId>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <target>     - string - template or item. \n'
            + '    <id>         - number - ID of the ListingItem or ListingItemTemplate. ';
    }

    public description(): string {
        return 'List the ShippingDestinations associated with a ListingItemTemplate or ListingItem.';
    }

    public example(): string {
        return 'shipping ' + this.getName() + ' template 1 ';
    }
}
