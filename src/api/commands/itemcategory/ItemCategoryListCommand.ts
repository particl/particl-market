// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import * as resources from 'resources';
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
import { InvalidParamException } from '../../exceptions/InvalidParamException';
import { MarketService } from '../../services/model/MarketService';
import { MissingParamException } from '../../exceptions/MissingParamException';

export class ItemCategoryListCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService,
        @inject(Types.Service) @named(Targets.Service.model.MarketService) private marketService: MarketService
    ) {
        super(Commands.CATEGORY_LIST);
        this.log = new Logger(__filename);
    }

    /**
     *
     * data.params[]:
     *  [0]: market: resources.Market, optional
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {
        const market: resources.Market = data.params[0];
        return await this.itemCategoryService.findRoot(market ? market.receiveAddress : undefined);
    }

    /**
     * data.params[]:
     *  [0]: marketId, optional, if market isn't given, return the list of default categories
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {

        if (data.params[0] === undefined && typeof data.params[0] !== 'number' && data.params[0] <= 0) {
            throw new InvalidParamException('marketId', 'number');
        }

        data.params[0] = await this.marketService.findOne(data.params[0]).then(value => value.toJSON());

        return data;
    }

    public usage(): string {
        return this.getName() + ' [marketId]';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <marketId>                    - number - Market ID. ';
    }

    public description(): string {
        return 'List all the ItemCategories.';
    }

    public example(): string {
        return 'category ' + this.getName() + ' 1 ';
    }

}
