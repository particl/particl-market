// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
import * as Bookshelf from 'bookshelf';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Logger as LoggerType } from '../../../core/Logger';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { ItemCategorySearchParams } from '../../requests/search/ItemCategorySearchParams';
import { MarketService } from '../../services/model/MarketService';

export class ItemCategorySearchCommand extends BaseCommand implements RpcCommandInterface<Bookshelf.Collection<ItemCategory>> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.CATEGORY_SEARCH);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: searchBy, string, can't be null
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<Bookshelf.Collection<ItemCategory>> {
        const name: string = data.params[0];
        const market: resources.Market = data.params[1];

        return await this.itemCategoryService.search({
            name,
            market: market.receiveAddress
        } as ItemCategorySearchParams);
    }

    /**
     * data.params[]:
     *  [0]: name, search string
     *  [0]: marketId
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('name');
        } else if (data.params.length < 2) {
            throw new MissingParamException('marketId');
        }

        if (typeof data.params[0] !== 'string') {
            throw new InvalidParamException('name', 'string');
        } else if (typeof data.params[1] !== 'number') {
            throw new InvalidParamException('marketId', 'number');
        }

        data.params[1] = await this.marketService.findOne(data.params[0]).then(value => value.toJSON());

        return data;
    }

    public usage(): string {
        return this.getName() + ' <name> <marketId> ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <name>                    - string - A search string for finding categories by name. \n'
            + '    <marketId>                - number - Market ID. ';
    }

    public description(): string {
        return 'Command for getting an item categories searchBy by particular searchBy string';
    }

    public example(): string {
        return 'category ' + this.getName() + ' luxury ';
    }
}
