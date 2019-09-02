// Copyright (c) 2017-2019, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as _ from 'lodash';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ListingItemService } from '../../services/model/ListingItemService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ListingItem } from '../../models/ListingItem';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ModelNotFoundException } from '../../exceptions/ModelNotFoundException';

export class ListingItemGetCommand extends BaseCommand implements RpcCommandInterface<ListingItem> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ListingItemService) public listingItemService: ListingItemService
    ) {
        super(Commands.ITEM_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: listingItem: resources.ListingItem
     *
     * when data.params[0] is number then findById, else findOneByHash
     *
     * @param data
     * @returns {Promise<ListingItem>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ListingItem> {
        const listingItem: resources.ListingItem = data.params[0];
        return await this.listingItemService.findOne(listingItem.id);

    }

    /**
     * data.params[]:
     *  [0]: listingItemId
     *
     * TODO: this command should be refactored as in the future hash could return multiple items
     *
     * @param {RpcRequest} data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params.length < 1) {
            throw new MissingParamException('listingItemId');
        }

        // if (data.params[0] && typeof data.params[0] !== 'number') {
        //    throw new InvalidParamException('listingItemId', 'number');
        // }

        let listingItem: resources.ListingItem;

        if (typeof data.params[0] === 'number') {
            listingItem = await this.listingItemService.findOne(data.params[0])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItem');
                });
        } else if (typeof data.params[0] === 'string') {
            listingItem = await this.listingItemService.findOneByHash(data.params[0])
                .then(value => value.toJSON())
                .catch(reason => {
                    throw new ModelNotFoundException('ListingItem');
                });
        } else {
            throw new InvalidParamException('listingItemId', 'number');
        }

        data.params[0] = listingItem;

        return data;
    }

    public usage(): string {
        return this.getName() + ' <listingItemId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <listingItemId>          - Numeric - The ID of the listing item we want to retrieve. \n'
            + '    <hash>                   - [optional] String - The hash of the listing item we want to retrieve. ';
    }

    public description(): string {
        return 'Get a listing item via listingItemId.';
    }

    public example(): string {
        return 'item ' + this.getName() + ' 1';
    }
}
