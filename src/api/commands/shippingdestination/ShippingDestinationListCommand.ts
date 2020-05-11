// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { ListingItemTemplateService } from '../../services/model/ListingItemTemplateService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ShippingDestination } from '../../models/ShippingDestination';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { MessageException } from '../../exceptions/MessageException';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';

export class ShippingDestinationListCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ShippingDestination>> {

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
     *  [1]: listingItemTemplateId or listingItemId
     *
     * @param data
     * @returns {Promise<ShippingDestination>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ShippingDestination>> {
        if ( data.params.length !== 2) {
            throw new MessageException('Expected 2 args, got <' + data.params.length + '>.');
        }
        const idType: string = data.params[0].toString().toLowerCase();
        if ( idType === 'template' ) {
            const templateId = data.params[1];
            let listingItem = await this.listingItemTemplateService.findOne(templateId, true);
            listingItem = listingItem.toJSON();
            return listingItem['ItemInformation']['ShippingDestinations'];
        } else if ( idType === 'item' ) {
            const itemId = data.params[1];
            let listingItem = await this.listingItemService.findOne(itemId, true);
            listingItem = listingItem.toJSON();
            return listingItem['ItemInformation']['ShippingDestinations'];
        } else {
            throw new MessageException(`Was expecting either "template" or "item" in arg[0], got <${idType}>.`);
        }
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        return data;
    }

    public usage(): string {
        return this.getName() + ' (template <listingItemTemplateId>|item <listingItemId>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    template <listingItemTemplateId>   - Numeric - ID of the item template object associated with \n'
            + '                                          the shipping destinations we want to list. \n'
            + '    item <listingItemId>               - Numeric - ID of the listing item whose shipping destinations \n'
            + '                                          we want to list. ';
    }

    public description(): string {
        return 'List the shipping destinations associated with a template or item.';
    }

    public example(): string {
        return 'shipping ' + this.getName() + ' template 1 ';
    }
}
