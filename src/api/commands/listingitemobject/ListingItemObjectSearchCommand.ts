// Copyright (c) 2017-2018, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemObjectService } from '../../services/ListingItemObjectService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItemObject } from '../../models/ListingItemObject';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { ListingItemObjectSearchParams } from '../../requests/ListingItemObjectSearchParams';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import {MessageException} from '../../exceptions/MessageException';

export class ListingItemObjectSearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ListingItemObject>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.ListingItemObjectService) public listingItemObjectService: ListingItemObjectService
    ) {
        super(Commands.ITEMOBJECT_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: searchString, string
     *
     * @param data
     * @returns {Promise<ListingItemObject>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ListingItemObject>> {
        return this.listingItemObjectService.search({
            searchString: data.params[0]
        } as ListingItemObjectSearchParams);
    }

    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length === 0) {
            throw new MessageException('Missing searchString.');
        }
        return data;
    }

    public usage(): string {
        return this.getName() + ' <searchString> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <searchString>           - String - A string that is used to find listing items objects by\n'
            + '                                matching their type or description. ';
    }

    public description(): string {
        return 'Search listing items objects by given string match with listing item object type or description.';
    }

    public example(): string {
        return 'itemobject ' + this.getName() + ' \'rubber chicken with a pully in the middle\' ';
    }
}
