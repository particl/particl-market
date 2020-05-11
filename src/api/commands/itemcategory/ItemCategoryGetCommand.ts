// Copyright (c) 2017-2020, The Particl Market developers
// Distributed under the GPL software license, see the accompanying
// file COPYING or https://github.com/particl/particl-market/blob/develop/LICENSE

import { Logger as LoggerType } from '../../../core/Logger';
import { inject, named } from 'inversify';
import { validate, request } from '../../../core/api/Validate';
import { Types, Core, Targets } from '../../../constants';
import { ItemCategoryService } from '../../services/model/ItemCategoryService';
import { RpcRequest } from '../../requests/RpcRequest';
import { ItemCategory } from '../../models/ItemCategory';
import { RpcCommandInterface } from '../RpcCommandInterface';
import { Commands} from '../CommandEnumType';
import { BaseCommand } from '../BaseCommand';
import { MissingParamException } from '../../exceptions/MissingParamException';
import { InvalidParamException } from '../../exceptions/InvalidParamException';

export class ItemCategoryGetCommand extends BaseCommand implements RpcCommandInterface<ItemCategory> {

    public log: LoggerType;

    constructor(
        @inject(Types.Core) @named(Core.Logger) public Logger: typeof LoggerType,
        @inject(Types.Service) @named(Targets.Service.model.ItemCategoryService) private itemCategoryService: ItemCategoryService
    ) {
        super(Commands.CATEGORY_GET);
        this.log = new Logger(__filename);
    }

    /**
     * data.params[]:
     *  [0]: id or key
     *
     * @param data
     * @returns {Promise<ItemCategory>}
     */
    @validate()
    public async execute( @request(RpcRequest) data: RpcRequest): Promise<ItemCategory> {
        if (typeof data.params[0] === 'number') {
            return await this.itemCategoryService.findOne(data.params[0]);
        } else {
            return await this.itemCategoryService.findOneByKey(data.params[0]);
        }
    }

    /**
     * data.params[]:
     *  [0]: id or key
     *
     * when data.params[0] is number then findById, else findOneByKey
     *
     * @param data
     * @returns {Promise<RpcRequest>}
     */
    public async validate(data: RpcRequest): Promise<RpcRequest> {
        if (data.params.length < 1) {
            throw new MissingParamException('categoryId|categoryKey');
        }

        if (typeof data.params[0] !== 'number' && typeof data.params[0] !== 'string') {
            throw new InvalidParamException('categoryId/categoryKey', 'number|string');
        }
        return data;
    }

    public usage(): string {
        return this.getName() + ' (<categoryId>|<categoryKey>) ';
    }

    public help(): string {
        return this.usage() + ' -  ' + this.description() + ' \n'
            + '    <categoryId>                  - Numeric - The ID belonging to the ItemCategory we \n'
            + '                                     want to retrive. \n'
            + '    <categoryKey>                 - String - The key that identifies the ItemCategory \n'
            + '                                     we want to retrieve. ';
    }

    public description(): string {
        return 'Command for getting an ItemCategory associated with id or key';
    }

    public example(): string {
        return 'category ' + this.getName() + ' 6 ';
    }
}
